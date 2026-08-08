import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "./services";
import { tokenStore } from "./api";
import type { User } from "./types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setLoading(false); return; }
    authService.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider
      value={{
        user, loading,
        login: async (email, password) => {
          const { token, user } = await authService.login(email, password);
          tokenStore.set(token);
          setUser(user);
        },
        logout: () => { tokenStore.clear(); setUser(null); window.location.href = "/login"; },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
