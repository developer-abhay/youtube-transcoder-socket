import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  CustomSocket,
  Timestamp_Updated,
  UnsubscribeEvent,
  User,
} from "../interfaces/types";
dotenv.config();
import { SubscribeEvent } from "../interfaces/types";
import { videoClients } from "../globals/globals";
import { subscriber } from "../services/redis";

// Utility function to parse cookies
export function parseCookies(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

// Verify JWT token from the headers cookie
export function verifyToken(token: string) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Invalid Secret");
    }
    const user = jwt.verify(token, process.env.JWT_SECRET) as User;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}

// Handle subscribing to a video
export function handleSubscribe(payload: SubscribeEvent, ws: CustomSocket) {
  const { video_id } = payload;

  console.log(`User ${ws.user.id} subscribed to video: ${video_id}`);

  // Add the videoId in the subscribed list in memory
  if (videoClients[video_id]) {
    videoClients[video_id].add(ws);
  } else {
    videoClients[video_id] = new Set();
    videoClients[video_id].add(ws);

    subscriber.subscribe(video_id, (message) => {
      const { timestamp } = JSON.parse(message);
      const broadcastpayload: Timestamp_Updated = {
        type: "video:timestamp_updated",
        timestamp,
        user_id: ws.user.id,
      };

      videoClients[video_id].forEach((client) => {
        client.send(JSON.stringify(broadcastpayload));
      });
    });
  }
}

// Handle unsubscribing from a video
export function handleUnsubscribe(payload: UnsubscribeEvent, ws: CustomSocket) {
  const { video_id } = payload;

  console.log(`User ${ws.user.id} unsubscribed from video: ${video_id}`);

  // Remove the videoId from the subscribed list in memory
  if (videoClients[video_id]) {
    videoClients[video_id].delete(ws);

    // If number of subscribers to a video is zero , remove it from in memory DB
    if (videoClients[video_id].size === 0) {
      delete videoClients[video_id];

      // Unsunscribe from pubsub and stop listeing for events on the channel of thag video
      subscriber.unsubscribe(video_id, (message) => {
        const { timestamp } = JSON.parse(message);
        const broadcastpayload: Timestamp_Updated = {
          type: "video:timestamp_updated",
          timestamp,
          user_id: ws.user.id,
        };

        videoClients[video_id].forEach((client) => {
          client.send(JSON.stringify(broadcastpayload));
        });
      });
    }
  }
}
