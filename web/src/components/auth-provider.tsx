"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const session = await authClient.getSession();
    if (!session.data?.user) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    const jwt = await authClient.token();
    if (!jwt.data?.token) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setUser({
      id: session.data.user.id,
      name: session.data.user.name,
      email: session.data.user.email,
    });
    setToken(jwt.data.token);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function loadSession() {
      await refresh();
    }
    void loadSession();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, refresh, signOut }),
    [user, token, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
