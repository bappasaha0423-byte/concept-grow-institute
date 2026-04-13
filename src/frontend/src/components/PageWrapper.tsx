import { AppShell } from "../components/Layout/AppShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import type { UserRole } from "../types";

interface PageWrapperProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function PageWrapper({ children, requiredRole }: PageWrapperProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
