import { Navigate } from "react-router-dom";  
import { storage } from "@/lib/storage";  
export default function RequireAuth({ children }: { children: React.ReactNode }) {  
  if (!storage.getToken()) return <Navigate to="/login" replace />;  
  return <>{children}</>;  
}