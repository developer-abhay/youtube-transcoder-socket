import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomSocket, User } from '../interfaces/types';
dotenv.config()
import { SubscribeEvent } from "../interfaces/types";
import { videoClients } from '../globals/globals';
import { subscriber } from '../services/redis';

// Utility function to parse cookies
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);
}

// Verify JWT token from the headers cookie
export function verifyToken(token: string) {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Invalid Secret')
        }
        const user = jwt.verify(token, process.env.JWT_SECRET) as User;
        return {
            id: user.id,
            username: user.username,
            email: user.email
        };
    } catch {
        throw new Error('UNAUTHORIZED')
    }
}


// Handle subscribing to a video
export function handleSubscribe(payload: SubscribeEvent, ws: CustomSocket) {
    const { videoId } = payload;

    console.log(`User ${ws.user.id} subscribed to video: ${videoId}`);

    if (videoClients[videoId]) {
        videoClients[videoId].push(ws);
    } else {
        videoClients[videoId] = [ws]
        subscriber.subscribe(videoId, (message) => {
            console.log(JSON.parse(message))
        })
    }
}