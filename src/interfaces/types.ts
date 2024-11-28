import { WebSocket } from "ws";

export interface CustomSocket extends WebSocket {
    user: User
}
export interface User {
    id: string;
    username: string;
    email: string;
}

export interface SubscribeEvent {
    "type": "video:subscribe",
    "videoId": string
}