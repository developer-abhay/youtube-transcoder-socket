import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../interfaces/types';
dotenv.config()

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
        return user;
    } catch {
        throw new Error('UNAUTHORIZED')
    }
}
