const UNITS = [
  { name: "day", seconds: 60 * 60 * 24 },
  { name: "hour", seconds: 60 * 60 },
  { name: "minute", seconds: 60 },
] as const;

function plural(n: number, name: string) {
  return `${n} ${name}${n === 1 ? "" : "s"}`;
}

/** Human readable description of how long a secret lives, e.g. "7 days". */
export function describeTtl(seconds: number): string {
  for (const unit of UNITS) {
    if (seconds >= unit.seconds && seconds % unit.seconds === 0) {
      return plural(seconds / unit.seconds, unit.name);
    }
  }
  return plural(Math.max(1, Math.round(seconds / 60)), "minute");
}

/** e.g. "Deleted after 3 reads or 7 days, whichever comes first." */
export function describeExpiry(reads: number, ttlSeconds: number): string {
  const parts: string[] = [];
  if (reads > 0) parts.push(plural(reads, "read"));
  if (ttlSeconds > 0) parts.push(describeTtl(ttlSeconds));
  if (parts.length === 0) {
    return "Never deleted automatically: unlimited reads and no expiry.";
  }
  return `Deleted after ${parts.join(" or ")}${parts.length > 1 ? ", whichever comes first" : ""}.`;
}
