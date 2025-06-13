import { HandPriority } from "../types/index.js";
import { SimpleHandRaiseManager } from "../core/SimpleHandRaiseManager.js";

export class SimpleHandRaiseButton extends (Application as any) {
  private manager: SimpleHandRaiseManager;

  constructor() {
    super();
    this.manager = SimpleHandRaiseManager.getInstance();
  }

  static get defaultOptions(): any {
    return {
      ...super.defaultOptions,
      id: "rise-hand-button",
      title: "Rise Hand",
      template: "modules/rise-hand/templates/hand-raise-button.hbs",
      classes: ["rise-hand-button"],
      width: 250,
      height: 150,
      left: 120,
      top: 120,
      minimizable: true,
      resizable: false,
      popOut: true,
    };
  }

  getData(): any {
    const userId = (game as any)?.user?.id;
    const isInQueue = userId ? this.manager.isUserInQueue(userId) : false;
    const position = userId ? this.manager.getUserPosition(userId) : -1;

    return {
      isInQueue,
      position,
      canRaise: !isInQueue,
      buttonText: this.localize("RISE_HAND.ButtonText", "✋ Want to speak"),
      priorityNormal: this.localize("RISE_HAND.Priority.Normal", "Normal"),
      priorityUrgent: this.localize("RISE_HAND.Priority.Urgent", "Urgent"),
      youAreInQueue: this.localize(
        "RISE_HAND.Queue.YouAreInQueue",
        "You are in the queue"
      ),
      leaveQueue: this.localize("RISE_HAND.Queue.LeaveQueue", "Leave Queue"),
      queuePosition: this.localize(
        "RISE_HAND.Queue.Position",
        "Position in queue: {position}"
      ).replace("{position}", position.toString()),
    };
  }

  activateListeners(html: any): void {
    super.activateListeners(html);

    html.find("#raise-hand-normal").click(() => {
      this.manager.raiseHand(HandPriority.NORMAL);
      this.render();
    });

    html.find("#raise-hand-urgent").click(() => {
      this.manager.raiseHand(HandPriority.URGENT);
      this.render();
    });

    html.find("#lower-hand").click(() => {
      this.manager.lowerHand();
      this.render();
    });
  }

  private localize(key: string, fallback: string): string {
    return (game as any)?.i18n?.localize?.(key) || fallback;
  }

  render(force = false, options = {}): this {
    try {
      super.render(force, options);
    } catch (e) {
      console.warn("Rise Hand: Could not render button", e);
    }
    return this;
  }
}
