import { createClient } from 'redis';

export const subscriber = createClient();


export async function initRedis() {
    try {
        await subscriber.connect()
        console.log('Connected to Redis')
    } catch (error) {
        console.error('Error connecting to redis')
    }
}