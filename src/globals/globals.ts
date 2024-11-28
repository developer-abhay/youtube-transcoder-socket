import { WebSocket } from "ws";

export const videoClients: { [key: string]: WebSocket[] } = {};