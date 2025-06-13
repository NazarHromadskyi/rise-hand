import { HandRaiseRequest, HandPriority } from "../types/index.js";

export class SimpleHandRaiseManager {
  private static instance: SimpleHandRaiseManager;
  private queue: HandRaiseRequest[] = [];
  private readonly SOCKET_NAME = "module.rise-hand";

  public static getInstance(): SimpleHandRaiseManager {
    if (!SimpleHandRaiseManager.instance) {
      SimpleHandRaiseManager.instance = new SimpleHandRaiseManager();
    }
    return SimpleHandRaiseManager.instance;
  }

  constructor() {
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    (game as any)?.socket?.on(this.SOCKET_NAME, (data: any) => {
      this.handleSocketMessage(data);
    });
  }

  private handleSocketMessage(data: any): void {
    switch (data.type) {
      case "handRaised":
        this.onHandRaised(data.data);
        break;
      case "handLowered":
        this.onHandLowered(data.userId);
        break;
      case "wordGiven":
        this.onWordGiven(data.userId);
        break;
      case "queueCleared":
        this.onQueueCleared();
        break;
    }
  }

  public async raiseHand(
    priority: HandPriority = HandPriority.NORMAL
  ): Promise<void> {
    const userId = (game as any)?.user?.id;
    if (!userId) return;

    // Check if user is already in queue
    if (this.isUserInQueue(userId)) {
      this.showNotification("Already in queue", "warn");
      return;
    }

    const request: HandRaiseRequest = {
      id: this.generateId(),
      userId,
      userName: (game as any)?.user?.name || "Unknown",
      timestamp: Date.now(),
      priority,
    };

    // Add to queue locally for GM
    if ((game as any)?.user?.isGM) {
      this.addToQueue(request);
    }

    // Broadcast to all clients
    (game as any)?.socket?.emit(this.SOCKET_NAME, {
      type: "handRaised",
      data: request,
      userId,
    });

    // Show notification
    this.showNotification("Added to queue", "info");

    // Send chat message
    const message =
      priority === HandPriority.URGENT
        ? `${request.userName} raised their hand (URGENT)`
        : `${request.userName} raised their hand`;
    this.sendChatMessage(message);

    // Play sound for GM
    if ((game as any)?.user?.isGM) {
      this.playNotificationSound();
    }
  }

  public async lowerHand(): Promise<void> {
    const userId = (game as any)?.user?.id;
    if (!userId) return;

    if (!this.isUserInQueue(userId)) {
      return;
    }

    // Remove from queue locally for GM
    if ((game as any)?.user?.isGM) {
      await this.removeFromQueue(userId);
    }

    // Broadcast to all clients
    (game as any)?.socket?.emit(this.SOCKET_NAME, {
      type: "handLowered",
      userId,
    });

    // Show notification
    this.showNotification("Removed from queue", "info");

    // Send chat message
    this.sendChatMessage(`${(game as any)?.user?.name} lowered their hand`);
  }

  public async giveWord(userId: string): Promise<void> {
    if (!(game as any)?.user?.isGM) return;

    const request = this.queue.find((r) => r.userId === userId);
    if (!request) return;

    // Remove from queue
    await this.removeFromQueue(userId);

    // Broadcast to all clients
    (game as any)?.socket?.emit(this.SOCKET_NAME, {
      type: "wordGiven",
      userId,
    });

    // Send chat message
    this.sendChatMessage(`${request.userName} was given the word`);
  }

  public async removeFromQueue(userId: string): Promise<void> {
    if (!(game as any)?.user?.isGM) return;

    this.queue = this.queue.filter((r) => r.userId !== userId);
    this.updateUI();
  }

  public async clearQueue(): Promise<void> {
    if (!(game as any)?.user?.isGM) return;

    this.queue = [];

    // Broadcast to all clients
    (game as any)?.socket?.emit(this.SOCKET_NAME, {
      type: "queueCleared",
    });

    // Show notification
    this.showNotification("Queue cleared", "info");

    // Send chat message
    this.sendChatMessage("Hand raise queue has been cleared");

    this.updateUI();
  }

  private onHandRaised(request: HandRaiseRequest): void {
    if ((game as any)?.user?.isGM) {
      this.addToQueue(request);
      this.playNotificationSound();
    }
    this.updateUI();
  }

  private onHandLowered(userId: string): void {
    if ((game as any)?.user?.isGM) {
      this.removeFromQueue(userId);
    }
    this.updateUI();
  }

  private onWordGiven(userId: string): void {
    if ((game as any)?.user?.id === userId) {
      this.showNotification("You have been given the word", "info");
    }
    if ((game as any)?.user?.isGM) {
      this.removeFromQueue(userId);
    }
    this.updateUI();
  }

  private onQueueCleared(): void {
    if (!(game as any)?.user?.isGM) {
      this.showNotification("Queue has been cleared", "info");
    }
    this.updateUI();
  }

  private addToQueue(request: HandRaiseRequest): void {
    // Remove existing request from same user
    this.removeFromQueue(request.userId);

    // Add based on priority
    if (request.priority === HandPriority.URGENT) {
      // Find first non-urgent request and insert before it
      const firstNormalIndex = this.queue.findIndex(
        (r) => r.priority === HandPriority.NORMAL
      );
      if (firstNormalIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(firstNormalIndex, 0, request);
      }
    } else {
      this.queue.push(request);
    }

    this.updateUI();
  }

  private sendChatMessage(content: string): void {
    try {
      (ChatMessage as any)?.create?.({
        content,
        speaker: { alias: "Rise Hand System" },
      });
    } catch (e) {
      console.warn("Rise Hand: Could not send chat message", e);
    }
  }

  private playNotificationSound(): void {
    try {
      // Try to play a sound
      if ((game as any)?.audio?.helper?.play) {
        (game as any).audio.helper.play({
          src: "sounds/notify.wav",
          volume: 0.3,
        });
      }
    } catch (e) {
      console.warn("Rise Hand: Could not play notification sound", e);
    }
  }

  private showNotification(
    message: string,
    type: "info" | "warn" | "error" = "info"
  ): void {
    try {
      (ui as any)?.notifications?.[type]?.(message);
    } catch (e) {
      console.warn("Rise Hand: Could not show notification", e);
    }
  }

  private updateUI(): void {
    try {
      (ui as any)?.riseHandQueue?.render?.();
      (ui as any)?.riseHandButton?.render?.();
    } catch (e) {
      // Ignore UI update errors for now
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public API methods
  public getQueue(): HandRaiseRequest[] {
    return [...this.queue];
  }

  public isUserInQueue(userId: string): boolean {
    return this.queue.some((r) => r.userId === userId);
  }

  public getUserPosition(userId: string): number {
    const index = this.queue.findIndex((r) => r.userId === userId);
    return index === -1 ? -1 : index + 1;
  }
}
