// src/app/router.tsx
import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { storage } from "@/lib/storage";
import { ALL_NAV_ITEMS } from "@/config/navigation";
import RequireAuth from "@/components/guards/RequireAuth";
import RequireRole from "@/components/guards/RequireRole";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoginPage from "@/features/auth/LoginPage";

export function AppRouter() {
  const authed = !!storage.getToken();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={authed ? <Navigate to="/settings" replace /> : <LoginPage />}
      />
      {ALL_NAV_ITEMS.map(({ path, component: C }) => (
        <Route
          key={path}
          path={path}
          element={
            <RequireAuth>
              <RequireRole>
                <DashboardLayout>
                  <Suspense fallback={<div className="p-4">Đang tải...</div>}>
                    <C />
                  </Suspense>
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />
      ))}
      <Route
        path="*"
        element={<Navigate to={authed ? "/settings" : "/login"} replace />}
      />
    </Routes>
  );
}
