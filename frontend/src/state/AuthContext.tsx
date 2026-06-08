import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

type AuthResponse = {
  user: User;
  onboardingRequired: boolean;
};

type AuthContextValue = {
  user: User | null;
  onboardingRequired: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
  setOnboardingComplete: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyAuth = (data: AuthResponse) => {
    setUser(data.user);
    setOnboardingRequired(data.onboardingRequired);
    return data;
  };

  const refreshMe = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<AuthResponse>("/auth/me");
      applyAuth(data);
    } catch {
      try {
        const refreshed = await api.post<{ user: User }>("/auth/refresh");
        setUser(refreshed.user);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      onboardingRequired,
      loading,
      login: (email, password) => api.post<AuthResponse>("/auth/login", { email, password }).then(applyAuth),
      register: (email, password) => api.post<AuthResponse>("/auth/register", { email, password }).then(applyAuth),
      refreshMe,
      logout: async () => {
        await api.post("/auth/logout");
        setUser(null);
        setOnboardingRequired(false);
      },
      setOnboardingComplete: () => setOnboardingRequired(false)
    }),
    [user, onboardingRequired, loading, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
