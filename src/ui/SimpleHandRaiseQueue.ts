import { HandRaiseRequest, HandPriority } from "../types/index.js";
import { SimpleHandRaiseManager } from "../core/SimpleHandRaiseManager.js";

export class SimpleHandRaiseQueue extends foundry.applications.api
  .ApplicationV2 {
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
        this.render(); // Force re-render if window is open
      }
    });
  }

  static DEFAULT_OPTIONS = {
    id: "rise-hand-queue",
    tag: "form",
    window: {
      title: "Hand Raise Queue",
      contentClasses: ["rise-hand-queue"],
      resizable: true,
      positioned: true,
    },
    position: {
      width: 450,
      height: 350,
      left: 200,
      top: 200,
    },
    form: {
      handler: () => {},
      submitOnChange: false,
      closeOnSubmit: false,
    },
    actions: {
      giveWord: this.prototype._onGiveWord,
      removeUser: this.prototype._onRemoveUser,
      clearAll: this.prototype._onClearAll,
      leaveQueue: this.prototype._onLeaveQueue,
    },
  };

  static PARTS = {
    form: {
      template: "modules/rise-hand/templates/hand-raise-queue.hbs",
    },
  };

  get title(): string {
    const isGM = (game as any)?.user?.isGM;
    return isGM ? "Hand Raise Queue" : "Hand Raise Queue (View Only)";
  }

  _prepareContext(options: any): any {
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

  async _onRender(context: any, options: any): Promise<void> {
    // Application V2 handles rendering automatically
    // Custom render logic can be added here if needed
  }

  async _renderHTML(
    context: any,
    options: any
  ): Promise<{ [partId: string]: string }> {
    const parts: { [partId: string]: string } = {};

    for (const [partId, partConfig] of Object.entries(
      (this.constructor as any).PARTS
    )) {
      const template = (partConfig as any).template;
      if (template) {
        parts[partId] = await foundry.applications.handlebars.renderTemplate(
          template,
          context
        );
      }
    }

    return parts;
  }

  _replaceHTML(
    result: { [partId: string]: string },
    content: HTMLElement,
    options: any
  ): void {
    for (const [partId, html] of Object.entries(result)) {
      const element =
        content.querySelector(`[data-application-part="${partId}"]`) || content;
      if (element) {
        element.innerHTML = html;
      }
    }
  }

  async _onGiveWord(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    const userId = target.dataset.userId;
    if (userId) {
      this.manager.giveWord(userId);
      this.render();
    }
  }

  async _onRemoveUser(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    const userId = target.dataset.userId;
    if (userId) {
      this.manager.removeFromQueue(userId);
      this.render();
    }
  }

  async _onClearAll(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    this.manager.clearQueue();
    this.render();
  }

  async _onLeaveQueue(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    this.manager.lowerHand();
    this.close(); // Close window after leaving queue
  }

  private localize(key: string, fallback: string): string {
    return (game as any)?.i18n?.localize?.(key) || fallback;
  }

  async render(options: any = {}): Promise<this> {
    console.log(
      "SimpleHandRaiseQueue | Rendering queue window, user is GM:",
      (game as any)?.user?.isGM
    );

    try {
      return await super.render(options);
    } catch (e) {
      console.warn("Rise Hand: Could not render queue", e);
      return this;
    }
  }
}
