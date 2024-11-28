import { CustomSocket } from "../interfaces/types";

export const videoClients: { [key: string]: Set<CustomSocket> } = {}