import { HandPriority } from "../types/index.js";
import { SimpleHandRaiseManager } from "../core/SimpleHandRaiseManager.js";

export class SimpleHandRaiseButton extends foundry.applications.api
  .ApplicationV2 {
  private manager: SimpleHandRaiseManager;

  constructor() {
    super();
    this.manager = SimpleHandRaiseManager.getInstance();
  }

  static DEFAULT_OPTIONS = {
    id: "rise-hand-button",
    tag: "form",
    window: {
      title: "Rise Hand",
      contentClasses: ["rise-hand-button"],
      resizable: false,
      positioned: true,
    },
    position: {
      width: 250,
      height: 150,
      left: 120,
      top: 120,
    },
    form: {
      handler: () => {},
      submitOnChange: false,
      closeOnSubmit: false,
    },
    actions: {
      raiseNormal: this.prototype._onRaiseHandNormal,
      raiseUrgent: this.prototype._onRaiseHandUrgent,
      lowerHand: this.prototype._onLowerHand,
    },
  };

  static PARTS = {
    form: {
      template: "modules/rise-hand/templates/hand-raise-button.hbs",
    },
  };

  get title(): string {
    return "Rise Hand";
  }

  _prepareContext(options: any): any {
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

  async _onRaiseHandNormal(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    this.manager.raiseHand(HandPriority.NORMAL);
    this.render();
  }

  async _onRaiseHandUrgent(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    this.manager.raiseHand(HandPriority.URGENT);
    this.render();
  }

  async _onLowerHand(event: Event, target: HTMLElement): Promise<void> {
    event.preventDefault();
    this.manager.lowerHand();
    this.render();
  }

  private localize(key: string, fallback: string): string {
    return (game as any)?.i18n?.localize?.(key) || fallback;
  }

  async render(options: any = {}): Promise<this> {
    try {
      return await super.render(options);
    } catch (e) {
      console.warn("Rise Hand: Could not render button", e);
      return this;
    }
  }
}
