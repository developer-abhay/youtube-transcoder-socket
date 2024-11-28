import { WebSocketServer } from 'ws';
import { handleSubscribe, handleUnsubscribe, parseCookies, verifyToken } from './helper/helper';
import { CustomSocket } from './interfaces/types';
import { initRedis } from './services/redis';

const port = Number(process.env.PORT) || 3005
const wss = new WebSocketServer({ port });

// Initialize Redis Client
initRedis()

// Web socket events
wss.on('connection', (ws: CustomSocket, req) => {
    try {
        // Get cookies from the request headers
        const cookies = parseCookies(req.headers.cookie || '');
        const accessToken = cookies['access-token'];

        if (!accessToken) {
            console.error('Access token missing in cookies');
            ws.send(JSON.stringify({ error: 'UNAUTHORIZED' }));
            return ws.close();
        }

        // Verify token from the cookies
        ws.user = verifyToken(cookies['access-token']);

        console.log(`User with ID ${ws.user.id} has connected`);

        // Handle incoming messages from the client
        ws.on('message', async (message: string) => {
            const payload = JSON.parse(message);

            switch (payload.type) {
                case 'video:subscribe':
                    handleSubscribe(payload, ws);
                    break;

                case 'video:unsubscribe':
                    handleUnsubscribe(payload, ws);
                    break;

                default:
                    console.log('Unknown event type');
            }
        });

        // Handle the client disconnecting
        ws.on('close', () => {
            console.log(`User disconnected`);

        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Connection error:', error.message);
        } else {
            console.error('Connection error');
        }
        ws.send(JSON.stringify({ error: 'UNAUTHORIZED' }));
        ws.close();
    }

});
console.log('Socket Server is Listening')


