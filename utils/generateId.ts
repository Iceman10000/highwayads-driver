// utils/generateId.ts
export function generateClientId(): string {
  // Simple low–collision ID good enough for client-side queue tracking
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  );
}
