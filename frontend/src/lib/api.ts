import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const USE_MOCK = !API_BASE_URL;

export const AUTH_MODE =
  ((import.meta.env.VITE_AUTH_MODE as string | undefined) ?? "form").toLowerCase() === "json"
    ? "json"
    : "form";

export const api = axios.create({
  baseURL: API_BASE_URL || "/",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

const TOKEN_KEY = "itoms_token";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      tokenStore.clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function apiError(e: unknown, fallback = "Request failed"): string {
  const err = e as AxiosError<{ detail?: string | { msg: string }[] }>;
  const d = err?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return err?.message || fallback;
}
