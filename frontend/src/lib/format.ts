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