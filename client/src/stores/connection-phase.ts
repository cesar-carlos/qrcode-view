export type ConnectionPhase =
  "disconnected" | "awaiting_qr" | "awaiting_pair" | "connected";

export function deriveConnectionPhase(input: {
  loggedIn: boolean;
  connected: boolean;
  pendingAction: "qr" | "pair" | null;
}): ConnectionPhase {
  if (input.loggedIn) {
    return "connected";
  }
  if (input.pendingAction === "pair") {
    return "awaiting_pair";
  }
  if (input.pendingAction === "qr" || input.connected) {
    return "awaiting_qr";
  }
  return "disconnected";
}
