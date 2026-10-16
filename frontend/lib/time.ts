// Relative time formatting utility

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Convert an ISO date string to a human-readable relative time string.
 * e.g. "2 hours ago", "Yesterday", "3 days ago"
 */
export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  if (diff < 0) return "Just now";
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY * 2) return "Yesterday";
  if (diff < DAY * 7) {
    const days = Math.floor(diff / DAY);
    return `${days} days ago`;
  }
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default relativeTime;

