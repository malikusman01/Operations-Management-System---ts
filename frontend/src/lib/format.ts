import { USE_MOCK } from "./api";
import { mockUsers } from "./mock";
import { store } from "./store";
import type { User } from "./types";

export const userName = (id: string, users?: User[]) => {
  const list = users ?? (USE_MOCK ? store.users.list() : mockUsers);
  return list.find((u) => u.id === id)?.fullName ?? id;
};

export const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

export const fmtDateTime = (s: string) =>
  s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
// "Just now" / "5m ago" / "3h ago" / "2d ago", falling back to a short date
// once it's more than a week old — the kind of stamp a messaging app uses.
export const relativeTime = (s: string) => {
  if (!s) return "—";
  const date = new Date(s);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
// "1h 24m" style duration from a total second count — for the task timer.
export const fmtDuration = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// "2d left" / "Due today" / "Overdue by 3h" for the tasks "Time left" column.
export const timeLeft = (deadline: string) => {
  if (!deadline) return { label: "No deadline", overdue: false };
  const diffMs = new Date(deadline).getTime() - Date.now();
  const overdue = diffMs < 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  if (!overdue && days === 0 && hours < 24 && diffMs < 86_400_000 && diffMs >= 0) {
    if (hours < 1) return { label: "Due soon", overdue: false };
    return { label: `Due in ${hours}h`, overdue: false };
  }
  if (overdue) {
    if (days > 0) return { label: `Overdue by ${days}d`, overdue: true };
    return { label: `Overdue by ${hours}h`, overdue: true };
  }
  if (days > 0) return { label: `${days}d left`, overdue: false };
  return { label: `${hours}h left`, overdue: false };
};