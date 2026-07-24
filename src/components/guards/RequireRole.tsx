import { Navigate, useLocation } from "react-router-dom";
import { useAuthInfo } from "@/features/auth/queries";
import { getIdByPath } from "@/config/navigation";

const EXEMPT = ["/settings", "/political-work-report"];

export default function RequireRole({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account, role, tenChucnang, isLoading } = useAuthInfo();
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

  const currentId = getIdByPath(location.pathname);
  if (currentId !== "settings" && !tenChucnang.includes(currentId)) {
    return <Navigate to="/settings" replace />;
  }
  return <>{children}</>;
}
