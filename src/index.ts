import { WebSocketServer } from 'ws';
import { parseCookies, verifyToken } from './helper/helper';
// import { broadcastTimestampUpdate, handleSubscribe, handleUnsubscribe } from './helper/helper';

const port = Number(process.env.PORT) || 3005
const wss = new WebSocketServer({ port });

wss.on('connection', (ws, req) => {
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
        const userData = verifyToken(cookies['access-token']);

        console.log(`User with ID ${userData.id} has connected`);

        // Handle incoming messages from the client
        ws.on('message', async (message: string) => {
            const payload = JSON.parse(message);

            console.log(payload);
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


