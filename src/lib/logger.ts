type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  action: string;
  userId?: string;
  [key: string]: unknown;
}

// Structured JSON logger for server-side actions.
// In production, these logs are captured by the hosting platform (Vercel, etc.).
export function log(entry: LogEntry): void {
  const record = { ...entry, ts: new Date().toISOString() };
  if (entry.level === "error") {
    console.error(JSON.stringify(record));
  } else {
    console.log(JSON.stringify(record));
  }
}
