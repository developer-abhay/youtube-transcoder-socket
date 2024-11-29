import { WebSocket } from "ws";

export interface CustomSocket extends WebSocket {
  user: User;
}
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface SubscribeEvent {
  type: "video:subscribe";
  video_id: string;
}

export interface UnsubscribeEvent {
  type: "video:unsubscribe";
  video_id: string;
}

export interface Timestamp_Updated {
  type: "video:timestamp_updated";
  timestamp: number;
  user_id: string;
}
