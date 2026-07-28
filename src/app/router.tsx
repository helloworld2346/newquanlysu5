import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { storage } from "@/lib/storage";
import { ALL_NAV_ITEMS } from "@/config/navigation";
import RequireAuth from "@/components/guards/RequireAuth";
import RequireRole from "@/components/guards/RequireRole";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoginPage from "@/features/auth/LoginPage";

const CreateReport = lazy(() => import("@/features/reports/CreateReport"));
const ReportDetail = lazy(() => import("@/features/reports/ReportDetail"));

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRole>
        <DashboardLayout>
          <Suspense fallback={<div className="p-4">Đang tải...</div>}>
            {children}
          </Suspense>
        </DashboardLayout>
      </RequireRole>
    </RequireAuth>
  );
}

export function AppRouter() {
  const authed = !!storage.getToken();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={authed ? <Navigate to="/settings" replace /> : <LoginPage />}
      />

      <Route
        path="/daily-report/create"
        element={
          <Protected>
            <CreateReport />
          </Protected>
        }
      />
      <Route
        path="/daily-report/edit/:id"
        element={
          <Protected>
            <CreateReport />
          </Protected>
        }
      />
      <Route
        path="/daily-report/detail/:id"
        element={
          <Protected>
            <ReportDetail />
          </Protected>
        }
      />

      {ALL_NAV_ITEMS.map(({ path, component: C }) => (
        <Route
          key={path}
          path={path}
          element={
            <Protected>
              <C />
            </Protected>
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
