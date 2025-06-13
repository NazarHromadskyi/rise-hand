export enum HandPriority {
  NORMAL = "normal",
  URGENT = "urgent",
}

export interface HandRaiseRequest {
  id: string;
  userId: string;
  userName: string;
  timestamp: number;
  priority: HandPriority;
}

export interface HandRaiseQueueData {
  requests: HandRaiseRequest[];
}

export interface SocketData {
  type: string;
  data?: any;
  userId?: string;
}

export interface RiseHandAPI {
  raiseHand(priority: HandPriority): Promise<void>;
  lowerHand(): Promise<void>;
  giveWord(userId: string): Promise<void>;
  removeFromQueue(userId: string): Promise<void>;
  clearQueue(): Promise<void>;
  getQueue(): HandRaiseRequest[];
  isUserInQueue(userId: string): boolean;
  getUserPosition(userId: string): number;
  showUI(): void;
  showQueue(): void;
}

declare global {
  interface Game {
    riseHand?: RiseHandAPI;
  }
}
