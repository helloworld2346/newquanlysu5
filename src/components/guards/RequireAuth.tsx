import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";
import { storage } from "@/lib/storage";
export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!storage.getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
