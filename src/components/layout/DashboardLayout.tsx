import { useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";

const COLLAPSE_KEY = "sidebarCollapsed";
const BREAKPOINT = 1024;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(
    () =>
      window.innerWidth < BREAKPOINT ||
      localStorage.getItem(COLLAPSE_KEY) === "true",
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < BREAKPOINT) {
        setCollapsed(true);
      } else {
        setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="relative flex h-screen bg-primary text-foreground">
      <div
        className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-28" : "w-72"
        }`}
      >
        <Sidebar collapsed={collapsed} />
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label="Thu gọn/mở rộng menu"
        className={`absolute top-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-primary text-gold shadow-md transition-[left,background-color,color] duration-300 ease-in-out hover:bg-gold hover:text-primary ${
          collapsed ? "left-28" : "left-72"
        }`}
      >
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>

      <main className="flex flex-1 flex-col overflow-hidden p-3 pl-0">
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
