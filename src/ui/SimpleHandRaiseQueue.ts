import { HandRaiseRequest, HandPriority } from "../types/index.js";
import { SimpleHandRaiseManager } from "../core/SimpleHandRaiseManager.js";

export class SimpleHandRaiseQueue extends (Application as any) {
  private manager: SimpleHandRaiseManager;

  constructor() {
    super();
    this.manager = SimpleHandRaiseManager.getInstance();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for queue updates
    (Hooks as any)?.on?.("riseHandQueueUpdated", (queue: any[]) => {
      console.log(
        "SimpleHandRaiseQueue | Received queue update, length:",
        queue.length
      );
      if (this.rendered) {
        this.render(true); // Force re-render if window is open
      }
    });
  }

  static get defaultOptions(): any {
    const isGM = (game as any)?.user?.isGM;
    const title = isGM ? "Hand Raise Queue" : "Hand Raise Queue (View Only)";

    return {
      ...super.defaultOptions,
      id: "rise-hand-queue",
      title: title,
      template: "modules/rise-hand/templates/hand-raise-queue.hbs",
      classes: ["rise-hand-queue"],
      width: 450,
      height: 350,
      left: 200,
      top: 200,
      minimizable: true,
      resizable: true,
      popOut: true,
    };
  }

  getData(): any {
    const queue = this.manager.getQueue();
    const queueData = queue.map((request: HandRaiseRequest, index: number) => ({
      ...request,
      position: index + 1,
      timeString: new Date(request.timestamp).toLocaleTimeString(),
      isUrgent: request.priority === HandPriority.URGENT,
      priorityText:
        request.priority === HandPriority.URGENT ? "Urgent" : "Normal",
      priorityIcon: request.priority === HandPriority.URGENT ? "🚨" : "✋",
    }));

    const currentUserId = (game as any)?.user?.id;
    const isCurrentUserInQueue = currentUserId
      ? this.manager.isUserInQueue(currentUserId)
      : false;

    return {
      queue: queueData,
      hasQueue: queue.length > 0,
      emptyMessage: this.localize(
        "RISE_HAND.Queue.Empty",
        "No one is waiting to speak"
      ),
      giveWord: this.localize("RISE_HAND.Queue.GiveWord", "Give word"),
      remove: this.localize("RISE_HAND.Queue.Remove", "Remove"),
      clearAll: this.localize("RISE_HAND.Queue.ClearAll", "Clear All"),
      leaveQueue: this.localize("RISE_HAND.Queue.LeaveQueue", "Leave Queue"),
      isGM: (game as any)?.user?.isGM || false,
      isCurrentUserInQueue: isCurrentUserInQueue,
    };
  }

  activateListeners(html: any): void {
    super.activateListeners(html);

    // Give word button
    html.find(".give-word").click((event: any) => {
      const userId = event.currentTarget.dataset.userId;
      if (userId) {
        this.manager.giveWord(userId);
        this.render();
      }
    });

    // Remove button
    html.find(".remove-user").click((event: any) => {
      const userId = event.currentTarget.dataset.userId;
      if (userId) {
        this.manager.removeFromQueue(userId);
        this.render();
      }
    });

    // Clear all button
    html.find("#clear-all").click(() => {
      this.manager.clearQueue();
      this.render();
    });

    // Leave queue button (for players)
    html.find("#leave-queue").click(() => {
      this.manager.lowerHand();
      this.close(); // Close window after leaving queue
    });
  }

  private localize(key: string, fallback: string): string {
    return (game as any)?.i18n?.localize?.(key) || fallback;
  }

  render(force = false, options = {}): this {
    console.log(
      "SimpleHandRaiseQueue | Rendering queue window, user is GM:",
      (game as any)?.user?.isGM
    );

    try {
      super.render(force, options);
    } catch (e) {
      console.warn("Rise Hand: Could not render queue", e);
    }
    return this;
  }
}
