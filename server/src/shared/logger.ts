export function logInfo(
  message: string,
  meta?: Readonly<Record<string, string | number | boolean>>,
): void {
  console.log(JSON.stringify({ level: "info", message, ...meta }));
}

export function logError(message: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : "unknown";
  console.error(JSON.stringify({ level: "error", message, errorMessage }));
}
