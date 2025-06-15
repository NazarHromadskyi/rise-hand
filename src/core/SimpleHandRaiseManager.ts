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

    console.log(
      "Rise Hand | Player raising hand, adding to local queue first:",
      request
    );

    // Add to local queue immediately for UI responsiveness (for all users)
    this.addToQueue(request);

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
  }

  public async lowerHand(): Promise<void> {
    const userId = (game as any)?.user?.id;
    if (!userId) return;

    if (!this.isUserInQueue(userId)) {
      return;
    }

    console.log(
      "Rise Hand | Player lowering hand, removing from local queue first"
    );

    // Remove from local queue immediately
    this.queue = this.queue.filter((r) => r.userId !== userId);
    this.updateUI();

    // Broadcast to all OTHER clients
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

    const request = this.queue.find((r) => r.userId === userId);
    if (!request) return;

    this.queue = this.queue.filter((r) => r.userId !== userId);

    // Broadcast to all clients so they can update their local queue
    (game as any)?.socket?.emit(this.SOCKET_NAME, {
      type: "handLowered",
      userId,
    });

    // Show notification
    this.showNotification(`Removed ${request.userName} from queue`, "info");

    // Send chat message
    this.sendChatMessage(`${request.userName} was removed from the queue`);

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
    console.log(
      "Rise Hand | Processing hand raised from socket:",
      request.userName
    );
    console.log("Rise Hand | Current user is GM:", (game as any)?.user?.isGM);
    console.log(
      "Rise Hand | Is this user's own request:",
      request.userId === (game as any)?.user?.id
    );

    // Don't double-add if this is the user's own request (already added in raiseHand)
    const isOwnRequest = request.userId === (game as any)?.user?.id;

    if (!isOwnRequest) {
      console.log("Rise Hand | Adding other user's request to local queue");
      this.addToQueue(request);
    } else {
      console.log("Rise Hand | Skipping own request (already added locally)");
    }

    // GM plays sound for any request
    if ((game as any)?.user?.isGM) {
      // Auto-show queue window for GM when someone raises hand
      console.log("Rise Hand | Auto-showing queue window for GM");
      this.autoShowQueueForGM();
    }

    this.updateUI();
  }

  private onHandLowered(userId: string): void {
    console.log(
      "Rise Hand | Processing hand lowered from socket for user:",
      userId
    );
    console.log(
      "Rise Hand | Is this user's own request:",
      userId === (game as any)?.user?.id
    );

    // Always remove from local queue - this handles both self-removal and GM removal
    console.log("Rise Hand | Removing user from local queue");
    this.queue = this.queue.filter((r) => r.userId !== userId);

    this.updateUI();
  }

  private onWordGiven(userId: string): void {
    console.log("Rise Hand | Processing word given to user:", userId);

    if ((game as any)?.user?.id === userId) {
      this.showNotification("You have been given the word", "info");
    }

    // Both GM and players need to update their local queue for UI consistency
    this.queue = this.queue.filter((r) => r.userId !== userId);
    console.log("Rise Hand | Updated local queue after word given");

    this.updateUI();
  }

  private onQueueCleared(): void {
    console.log("Rise Hand | Processing queue cleared");

    if (!(game as any)?.user?.isGM) {
      this.showNotification("Queue has been cleared", "info");
    }

    // Clear local queue for all users
    this.queue = [];
    console.log("Rise Hand | Local queue cleared");

    this.updateUI();
  }

  private addToQueue(request: HandRaiseRequest): void {
    console.log(
      "Rise Hand | Adding to queue:",
      request.userName,
      "Priority:",
      request.priority
    );

    // Remove existing request from same user
    this.queue = this.queue.filter((r) => r.userId !== request.userId);

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

    console.log(
      "Rise Hand | Queue after adding:",
      this.queue.map((r) => `${r.userName}(${r.priority})`)
    );
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
      // Trigger Foundry hooks for UI updates
      (Hooks as any)?.call?.("riseHandQueueUpdated", this.queue);
      (Hooks as any)?.call?.("riseHandButtonUpdated", this.queue);

      console.log(
        "Rise Hand | UI update triggered, queue length:",
        this.queue.length
      );
    } catch (e) {
      console.warn("Rise Hand: Could not trigger UI update", e);
    }
  }

  private autoShowQueueForGM(): void {
    try {
      // Trigger hook to auto-show queue window for GM
      (Hooks as any)?.call?.("riseHandAutoShowQueue");
      console.log("Rise Hand | Auto-show queue hook triggered");
    } catch (e) {
      console.warn("Rise Hand: Could not trigger auto-show queue", e);
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
    const result = this.queue.some((r) => r.userId === userId);
    console.log(`Manager | isUserInQueue(${userId}):`, result);
    console.log(
      "Manager | Current queue user IDs:",
      this.queue.map((r) => r.userId)
    );
    return result;
  }

  public getUserPosition(userId: string): number {
    const index = this.queue.findIndex((r) => r.userId === userId);
    return index === -1 ? -1 : index + 1;
  }
}
