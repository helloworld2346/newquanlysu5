import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthInfo } from "@/features/auth/queries";
import { getIdByPath, getNavItemsByRole } from "@/config/navigation";

const EXEMPT = ["/settings", "/political-work-report"];

export default function RequireRole({ children }: { children: ReactNode }) {
  const { account, role, capDonVi, tenChucnang, isLoading } = useAuthInfo();
  const location = useLocation();

  if (isLoading) return <div className="p-4">Đang tải...</div>;
  if (!account) return <Navigate to="/login" replace />;

  const donVi = account.donVi ?? null;
  if (
    role !== "Quản Trị Viên" &&
    donVi &&
    donVi.quanSoTong === 0 &&
    !EXEMPT.includes(location.pathname)
  ) {
    return <Navigate to="/settings" replace />;
  }
  if (role === "Quản Trị Viên") return <>{children}</>;

  const allowed = getNavItemsByRole(role || null, capDonVi, tenChucnang);
  const currentId = getIdByPath(location.pathname);
  const ok =
    currentId === "settings" || allowed.some((i) => i.id === currentId);
  if (!ok) return <Navigate to="/settings" replace />;
  return <>{children}</>;
}
