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