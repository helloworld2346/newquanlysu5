// src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/app/queryClient";

function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground">
        <h1 className="mb-4 text-xl font-semibold">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">LoginPage placeholder</p>
      </div>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b p-4 text-lg font-semibold">
        Quản lý Sư đoàn 5
      </header>
      <main className="p-4">
        <p className="text-muted-foreground">DashboardLayout placeholder</p>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
