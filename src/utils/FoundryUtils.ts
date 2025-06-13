// Helper functions for safe Foundry VTT API usage

export function localize(key: string, fallback: string = ""): string {
  return (game as any)?.i18n?.localize?.(key) || fallback;
}

export function formatText(
  key: string,
  data: Record<string, any>,
  fallback: string = ""
): string {
  return (game as any)?.i18n?.format?.(key, data) || fallback;
}

export function showNotification(
  message: string,
  type: "info" | "warn" | "error" = "info"
): void {
  (ui as any)?.notifications?.[type]?.(message);
}

export function sendChatMessage(content: string, speaker?: any): void {
  (ChatMessage as any)?.create?.({
    content,
    speaker: speaker || { alias: "Rise Hand System" },
  });
}

export function playSound(src: string, volume: number = 0.3): void {
  try {
    // Try modern Foundry API first
    if ((game as any)?.audio?.helper?.play) {
      (game as any).audio.helper.play({ src, volume });
    } else if ((window as any)?.AudioHelper?.play) {
      // Fallback to older API
      (window as any).AudioHelper.play({
        src,
        volume,
        autoplay: true,
        loop: false,
      });
    }
  } catch (e) {
    console.warn("Rise Hand: Could not play notification sound", e);
  }
}

export function emitSocket(eventName: string, data: any): void {
  (game as any)?.socket?.emit?.(eventName, data);
}

export function isGM(): boolean {
  return (game as any)?.user?.isGM || false;
}

export function getCurrentUserId(): string | null {
  return (game as any)?.user?.id || null;
}

export function getCurrentUserName(): string {
  return (game as any)?.user?.name || "Unknown";
}
