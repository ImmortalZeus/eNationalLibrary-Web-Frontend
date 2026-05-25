// src/context/AuthContext.tsx
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload, UserRole } from "../types";

interface AuthContextValue {
  token:     string | null;
  user:      JwtPayload | null;
  role:      UserRole | null;
  readerId:  string | null;
  saveToken: (token: string) => void;
  setReaderId: (id: string) => void;
  logout:    () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<JwtPayload | null>(() => {
    const t = localStorage.getItem("accessToken");
    return t ? jwtDecode<JwtPayload>(t) : null;
  });
  const [readerId, setReaderIdState] = useState<string | null>(
    () => localStorage.getItem("readerId")
  );

  const saveToken = useCallback((t: string) => {
    localStorage.setItem("accessToken", t);
    setToken(t);
    setUser(jwtDecode<JwtPayload>(t));
  }, []);

  const setReaderId = useCallback((id: string) => {
    localStorage.setItem("readerId", id);
    setReaderIdState(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("readerId");
    setToken(null);
    setUser(null);
    setReaderIdState(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, role: user?.role ?? null,
      readerId, saveToken, setReaderId, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}