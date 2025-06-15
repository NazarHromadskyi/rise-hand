import { SimpleHandRaiseManager } from "../core/SimpleHandRaiseManager.js";
import { SimpleHandRaiseQueue } from "./SimpleHandRaiseQueue.js";
import { HandPriority } from "../types/index.js";
import { isGM } from "../utils/FoundryUtils.js";

export class ChatButton {
  private static instance: ChatButton | null = null;
  private manager: SimpleHandRaiseManager;
  private queueWindow: SimpleHandRaiseQueue | null = null;
  private buttonElement: HTMLButtonElement | null = null;

  private constructor() {
    this.manager = SimpleHandRaiseManager.getInstance();
  }

  public static getInstance(): ChatButton {
    if (!ChatButton.instance) {
      ChatButton.instance = new ChatButton();
    }
    return ChatButton.instance;
  }

  public initialize(): void {
    this.addChatButton();
    this.setupEventListeners();
  }

  private addChatButton(): void {
    const addButton = () => {
      console.log("Rise Hand | Attempting to add chat button...");

      // Look specifically for chat-controls class
      let targetElement = document.querySelector(".chat-controls");

      if (targetElement) {
        console.log("Rise Hand | Found .chat-controls element");
      } else {
        // Fallback selectors if chat-controls not found
        const fallbackSelectors = [
          "#chat-controls",
          "#chat .control-buttons",
          "#chat-form",
          "#sidebar #chat",
        ];

        for (const selector of fallbackSelectors) {
          targetElement = document.querySelector(selector);
          if (targetElement) {
            console.log(`Rise Hand | Found fallback target: ${selector}`);
            break;
          }
        }
      }

      //   // If no standard location found, try to create our own container
      //   if (!targetElement) {
      //     const chatElement = document.querySelector("#chat");
      //     if (chatElement) {
      //       console.log("Rise Hand | Creating custom button container");
      //       const customContainer = document.createElement("div");
      //       customContainer.id = "rise-hand-custom-controls";
      //       customContainer.style.cssText =
      //         "position: absolute; top: 10px; right: 10px; z-index: 1000;";
      //       chatElement.appendChild(customContainer);
      //       targetElement = customContainer;
      //     }
      //   }

      if (targetElement && !document.querySelector("#rise-hand-chat-button")) {
        this.buttonElement = document.createElement(
          "button"
        ) as HTMLButtonElement;
        this.buttonElement.id = "rise-hand-chat-button";
        this.buttonElement.type = "button";
        this.buttonElement.title = this.localize(
          "RISE_HAND.ChatButton.Title",
          "Raise Hand"
        );
        this.buttonElement.innerHTML = '<i class="fas fa-hand-paper"></i>';

        // Style to match other chat control buttons
        this.buttonElement.style.cssText = `
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          width: 30px;
          height: 30px;
          border-radius: 3px;
          cursor: pointer;
          margin: 0 2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s ease;
          flex: 0 0 auto;
        `;

        // Add hover effects
        this.buttonElement.addEventListener("mouseenter", () => {
          if (this.buttonElement) {
            this.buttonElement.style.background = "rgba(220, 53, 69, 0.8)";
            this.buttonElement.style.color = "#fff";
            this.buttonElement.style.borderColor = "#dc3545";
          }
        });

        this.buttonElement.addEventListener("mouseleave", () => {
          if (this.buttonElement) {
            const userId = (game as any)?.user?.id;
            const isInQueue = userId
              ? this.manager.isUserInQueue(userId)
              : false;
            if (isInQueue) {
              this.buttonElement.style.background = "rgba(220, 53, 69, 0.6)";
              this.buttonElement.style.color = "#fff";
              this.buttonElement.style.borderColor = "#dc3545";
            } else {
              this.buttonElement.style.background = "rgba(0, 0, 0, 0.5)";
              this.buttonElement.style.color = "rgba(255, 255, 255, 0.8)";
              this.buttonElement.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }
          }
        });

        // Add click handler
        this.buttonElement.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleButtonClick();
        });

        targetElement.appendChild(this.buttonElement);
        this.updateButtonState();
        console.log("Rise Hand | Chat button added successfully!");
      } else {
        console.log(
          "Rise Hand | Could not find suitable location for chat button"
        );
      }
    };

    // Try adding the button multiple times with delays
    setTimeout(addButton, 100);
    setTimeout(addButton, 500);
    setTimeout(addButton, 1000);
    setTimeout(addButton, 2000);

    // Hook into various render events
    (Hooks as any)?.on?.("renderChatLog", addButton);
    (Hooks as any)?.on?.("renderSidebar", addButton);
    (Hooks as any)?.on?.("ready", addButton);
  }

  private handleButtonClick(): void {
    const userId = (game as any)?.user?.id;

    if (!userId) return;

    console.log("ChatButton | Button clicked by user:", userId);
    console.log("ChatButton | Is GM:", isGM());
    console.log("ChatButton | Current queue:", this.manager.getQueue());
    console.log(
      "ChatButton | Is user in queue:",
      this.manager.isUserInQueue(userId)
    );

    // If GM, always show queue window (no priority dialog)
    if (isGM()) {
      console.log("ChatButton | GM detected, showing queue");
      this.showQueue();
      return;
    }

    // If user is already in queue, show queue window
    if (this.manager.isUserInQueue(userId)) {
      console.log("ChatButton | User is in queue, showing queue window");
      this.showQueue();
      return;
    }

    // Show priority selection menu (only for players not in queue)
    console.log("ChatButton | User not in queue, showing priority menu");
    this.showPriorityMenu();
  }

  private showPriorityMenu(): void {
    const menuHtml = `
      <div class="rise-hand-priority-menu">
        <h3>${this.localize("RISE_HAND.ButtonText", "✋ Want to speak")}</h3>
        <div class="priority-options">
          <button class="priority-option normal" data-priority="normal">
            <i class="fas fa-hand-paper"></i>
            ${this.localize("RISE_HAND.Priority.Normal", "Normal")}
          </button>
          <button class="priority-option urgent" data-priority="urgent">
            <i class="fas fa-exclamation-triangle"></i>
            ${this.localize("RISE_HAND.Priority.Urgent", "Urgent")}
          </button>
        </div>
      </div>
    `;

    // Create dialog
    const dialog = new (Dialog as any)(
      {
        title: this.localize("RISE_HAND.ButtonText", "Raise Hand"),
        content: menuHtml,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: this.localize("RISE_HAND.Cancel", "Cancel"),
          },
        },
        render: (html: any) => {
          // Add click handlers for priority buttons
          html.find(".priority-option").click((e: any) => {
            const priority = e.currentTarget.dataset.priority as HandPriority;
            this.manager.raiseHand(priority);
            dialog.close();
            this.showQueue();
          });
        },
        close: () => {},
      },
      {
        classes: ["rise-hand-dialog"],
        width: 300,
      }
    );

    dialog.render(true);
  }

  private showQueue(): void {
    console.log("ChatButton | Showing queue window");

    // Always create a new instance to avoid stale state issues
    // This fixes the issue where GM cannot reopen the queue window after closing it
    if (this.queueWindow) {
      try {
        this.queueWindow.close();
      } catch (e) {
        console.warn("Rise Hand: Could not close previous queue window", e);
      }
    }

    this.queueWindow = new SimpleHandRaiseQueue();
    this.queueWindow.render(true);
  }

  private setupEventListeners(): void {
    // Update button state when queue changes
    (Hooks as any)?.on?.("riseHandQueueUpdated", (queue: any[]) => {
      console.log("ChatButton | Received queue update, length:", queue.length);
      this.updateButtonState();
      if (this.queueWindow) {
        this.queueWindow.render(true); // Force re-render
      }
    });

    (Hooks as any)?.on?.("riseHandButtonUpdated", () => {
      console.log("ChatButton | Received button update");
      this.updateButtonState();
    });

    // Clean up queue window reference when it's closed
    (Hooks as any)?.on?.("riseHandQueueClosed", () => {
      console.log("ChatButton | Queue window closed, clearing reference");
      this.queueWindow = null;
    });
  }

  private updateButtonState(): void {
    if (!this.buttonElement) return;

    const userId = (game as any)?.user?.id;
    const isUserGM = isGM();
    const isInQueue = userId ? this.manager.isUserInQueue(userId) : false;
    const queue = this.manager.getQueue();
    const hasQueue = queue.length > 0;

    // Reset all classes
    this.buttonElement.classList.remove(
      "gm-button",
      "has-queue",
      "active",
      "player-button",
      "player-in-queue"
    );

    if (isUserGM) {
      // GM button - always shows queue management
      this.buttonElement.title = this.localize(
        "RISE_HAND.ChatButton.GMTitle",
        "Manage Hand Raise Queue"
      );
      this.buttonElement.innerHTML = '<i class="fas fa-users-cog"></i>';
      this.buttonElement.classList.add("gm-button");

      if (hasQueue) {
        this.buttonElement.classList.add("has-queue");
        this.buttonElement.title = this.localize(
          "RISE_HAND.ChatButton.GMTitleWithQueue",
          "Manage Hand Raise Queue ({count} in queue)"
        ).replace("{count}", queue.length.toString());
      }

      // Remove inline styles for GM button (CSS will handle it)
      this.buttonElement.style.background = "";
      this.buttonElement.style.color = "";
      this.buttonElement.style.borderColor = "";
    } else if (isInQueue) {
      // Player in queue - green hand icon
      const position = this.manager.getUserPosition(userId);
      this.buttonElement.title = this.localize(
        "RISE_HAND.ChatButton.InQueue",
        "In queue (position {position}) - Click to view queue"
      ).replace("{position}", position.toString());
      this.buttonElement.innerHTML = '<i class="fas fa-hand-paper"></i>';
      this.buttonElement.classList.add("player-in-queue");

      // Remove inline styles (CSS will handle it)
      this.buttonElement.style.background = "";
      this.buttonElement.style.color = "";
      this.buttonElement.style.borderColor = "";
    } else {
      // Player not in queue - red hand icon
      this.buttonElement.title = this.localize(
        "RISE_HAND.ChatButton.Title",
        "Raise Hand"
      );
      this.buttonElement.innerHTML = '<i class="fas fa-hand-paper"></i>';
      this.buttonElement.classList.add("player-button");

      // Remove inline styles (CSS will handle it)
      this.buttonElement.style.background = "";
      this.buttonElement.style.color = "";
      this.buttonElement.style.borderColor = "";
    }
  }

  private localize(key: string, fallback: string): string {
    return (game as any)?.i18n?.localize?.(key) || fallback;
  }

  public cleanup(): void {
    if (this.buttonElement) {
      this.buttonElement.remove();
      this.buttonElement = null;
    }

    if (this.queueWindow) {
      this.queueWindow.close();
      this.queueWindow = null;
    }
  }
}
