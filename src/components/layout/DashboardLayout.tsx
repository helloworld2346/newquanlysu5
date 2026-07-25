import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";

const COLLAPSE_KEY = "sidebarCollapsed";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "true",
  );

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div
      className={`relative grid h-screen bg-primary text-foreground ${
        collapsed ? "grid-cols-[5rem_1fr]" : "grid-cols-[18rem_1fr]"
      }`}
    >
      <Sidebar collapsed={collapsed} />

      <button
        type="button"
        onClick={toggle}
        aria-label="Thu gọn/mở rộng menu"
        className={`absolute top-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-primary text-gold shadow-md transition-colors hover:bg-gold hover:text-primary ${
          collapsed ? "left-[5rem]" : "left-[18rem]"
        }`}
      >
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>

      <main className="flex flex-col overflow-hidden p-3 pl-0">
        <header className="flex h-16 shrink-0 items-center justify-center px-3">
          <p className="truncate text-xl font-bold uppercase text-gold">
            Thống kê quân số, Hoạt động CTĐ, CTCT
          </p>
        </header>
        <div className="flex-1 overflow-y-auto rounded-2xl bg-background p-6 text-foreground shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
