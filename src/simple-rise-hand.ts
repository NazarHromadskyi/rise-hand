import { SimpleHandRaiseManager } from "./core/SimpleHandRaiseManager.js";
import { HandPriority, RiseHandAPI } from "./types/index.js";

class SimpleRiseHandModule {
  private manager: SimpleHandRaiseManager;

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
    };

    (game as any).riseHand = api;
  }

  private registerHooks(): void {
    // Register console commands for testing
    (Hooks as any)?.once?.("ready", () => {
      console.log("Rise Hand | Ready! Available commands:");
      console.log('- game.riseHand.raiseHand("normal")');
      console.log('- game.riseHand.raiseHand("urgent")');
      console.log("- game.riseHand.lowerHand()");
      console.log("- game.riseHand.getQueue()");

      // Add global debug functions
      (window as any).riseHandDebug = {
        raise: (priority = "normal") =>
          this.manager.raiseHand(priority as HandPriority),
        lower: () => this.manager.lowerHand(),
        queue: () => this.manager.getQueue(),
        clear: () => this.manager.clearQueue(),
      };
      console.log(
        "Rise Hand | Debug functions available at window.riseHandDebug"
      );
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
