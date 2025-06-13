import { SimpleHandRaiseManager } from "./core/SimpleHandRaiseManager.js";
import { HandPriority, RiseHandAPI } from "./types/index.js";
import { SimpleHandRaiseButton } from "./ui/SimpleHandRaiseButton.js";
import { SimpleHandRaiseQueue } from "./ui/SimpleHandRaiseQueue.js";
import { ChatButton } from "./ui/ChatButton.js";
import { isGM } from "./utils/FoundryUtils.js";

class SimpleRiseHandModule {
  private manager: SimpleHandRaiseManager;
  private handRaiseButton: SimpleHandRaiseButton | null = null;
  private handRaiseQueue: SimpleHandRaiseQueue | null = null;

  constructor() {
    this.manager = SimpleHandRaiseManager.getInstance();
  }

  public initialize(): void {
    console.log("Rise Hand | Initializing simple module for v13");

    // Register API
    this.registerAPI();

    // Register hooks
    this.registerHooks();

    console.log("Rise Hand | Simple module initialized");
  }

  private registerAPI(): void {
    const api: RiseHandAPI = {
      raiseHand: this.manager.raiseHand.bind(this.manager),
      lowerHand: this.manager.lowerHand.bind(this.manager),
      giveWord: this.manager.giveWord.bind(this.manager),
      removeFromQueue: this.manager.removeFromQueue.bind(this.manager),
      clearQueue: this.manager.clearQueue.bind(this.manager),
      getQueue: this.manager.getQueue.bind(this.manager),
      isUserInQueue: this.manager.isUserInQueue.bind(this.manager),
      getUserPosition: this.manager.getUserPosition.bind(this.manager),
      showUI: this.showUI.bind(this),
      showQueue: this.showQueue.bind(this),
    };

    (game as any).riseHand = api;
  }

  private showUI(): void {
    if (!this.handRaiseButton) {
      this.handRaiseButton = new SimpleHandRaiseButton();
    }
    this.handRaiseButton.render(true);
  }

  private showQueue(): void {
    console.log("SimpleRiseHandModule | Showing queue, user is GM:", isGM());
    if (!this.handRaiseQueue) {
      this.handRaiseQueue = new SimpleHandRaiseQueue();
    }
    this.handRaiseQueue.render(true);
  }

  private registerHooks(): void {
    // Register console commands for testing
    (Hooks as any)?.once?.("ready", () => {
      console.log("Rise Hand | Ready! Available commands:");
      console.log('- game.riseHand.raiseHand("normal")');
      console.log('- game.riseHand.raiseHand("urgent")');
      console.log("- game.riseHand.lowerHand()");
      console.log("- game.riseHand.getQueue()");
      console.log("- game.riseHand.showUI()");
      console.log("- game.riseHand.showQueue() [GM only]");

      // Add global debug functions
      (window as any).riseHandDebug = {
        raise: (priority = "normal") =>
          this.manager.raiseHand(priority as HandPriority),
        lower: () => this.manager.lowerHand(),
        queue: () => this.manager.getQueue(),
        clear: () => this.manager.clearQueue(),
        showUI: () => this.showUI(),
        showQueue: () => this.showQueue(),
        addChatButton: () => {
          const chatButton = ChatButton.getInstance();
          chatButton.initialize();
        },
      };
      console.log(
        "Rise Hand | Debug functions available at window.riseHandDebug"
      );

      // Auto-show UI for testing
      // Initialize chat button
      const chatButton = ChatButton.getInstance();
      chatButton.initialize();
    });

    // Listen for queue updates to refresh UI (legacy support)
    (Hooks as any)?.on?.("riseHandQueueUpdated", (queue: any[]) => {
      console.log(
        "SimpleRiseHandModule | Received queue update hook, length:",
        queue.length
      );

      // Force re-render both UI components
      if (this.handRaiseButton) {
        this.handRaiseButton.render(true);
      }
      if (this.handRaiseQueue && this.handRaiseQueue.rendered) {
        this.handRaiseQueue.render(true);
      }
    });
  }
}

// Initialize module
(Hooks as any)?.once?.("init", () => {
  const module = new SimpleRiseHandModule();
  module.initialize();
});

// Export for debugging
(window as any).SimpleRiseHandModule = SimpleRiseHandModule;
