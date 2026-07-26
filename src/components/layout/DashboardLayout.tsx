import { useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";
import dongsonBg from "@/assets/images/login-bg-dongson.png";

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

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="relative flex h-screen bg-primary text-foreground overflow-hidden">
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
        className={`absolute top-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-primary text-primary-foreground shadow-md transition-[left,background-color,color] duration-300 ease-in-out hover:bg-gold hover:text-primary ${
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
        {/* <header className="flex h-16 shrink-0 items-center justify-center px-3">
          <p className="truncate text-xl font-bold uppercase text-gold">
            Thống kê quân số, Hoạt động CTĐ, CTCT
          </p>
        </header> */}

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-background text-foreground shadow-sm">
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <Breadcrumb />
            <Topbar />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(${dongsonBg})`,
                backgroundSize: "60% auto",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="relative z-10 h-full overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
