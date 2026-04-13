import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserRole } from "../types";

interface AuthUser {
  principal: string;
  role: UserRole;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear, loginStatus, isInitializing } =
    useInternetIdentity();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (loginStatus === "success" && identity) {
      const principal = identity.getPrincipal().toText();
      const storedRole = localStorage.getItem(
        `role_${principal}`,
      ) as UserRole | null;
      const storedName = localStorage.getItem(`name_${principal}`) || "Student";
      setUser({
        principal,
        role: storedRole || "student",
        name: storedName,
      });
    } else if (loginStatus === "idle" && !identity) {
      setUser(null);
    } else if (loginStatus === "idle" && identity) {
      // Identity restored from local storage on init
      const principal = identity.getPrincipal().toText();
      const storedRole = localStorage.getItem(
        `role_${principal}`,
      ) as UserRole | null;
      const storedName = localStorage.getItem(`name_${principal}`) || "Student";
      setUser({
        principal,
        role: storedRole || "student",
        name: storedName,
      });
    }
  }, [loginStatus, identity]);

  function setRole(role: UserRole) {
    if (!user) return;
    localStorage.setItem(`role_${user.principal}`, role);
    setUser((prev) => (prev ? { ...prev, role } : null));
  }

  function logout() {
    clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isInitializing || loginStatus === "logging-in",
        isAuthenticated: !!user,
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
