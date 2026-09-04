import { useState, useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumb from "./Breadcrumb";
import dongsonBg from "@/assets/images/login-bg-dongson.png";

const COLLAPSE_KEY = "sidebarCollapsed";
const SWITCH_DELAY = 180;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const initialCollapsed = localStorage.getItem(COLLAPSE_KEY) === "true";
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [showCollapsed, setShowCollapsed] = useState(initialCollapsed);
  const switchTimer = useRef<number | null>(null);

  const applyCollapsed = (next: boolean, immediate = false) => {
    setCollapsed(next);
    if (switchTimer.current !== null) {
      window.clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
    if (!next || immediate) {
      setShowCollapsed(next);
    } else {
      switchTimer.current = window.setTimeout(() => {
        setShowCollapsed(true);
        switchTimer.current = null;
      }, SWITCH_DELAY);
    }
  };

  const toggle = () => {
    const next = !collapsed;
    localStorage.setItem(COLLAPSE_KEY, String(next));
    applyCollapsed(next);
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) applyCollapsed(true, true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (switchTimer.current !== null) {
        window.clearTimeout(switchTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative flex h-screen bg-primary text-foreground overflow-hidden">
      <div
        className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-28" : "w-72"
        }`}
      >
        <Sidebar collapsed={showCollapsed} />
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label="Thu gọn/mở rộng menu"
        className={`absolute top-1/2 z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-primary text-primary-foreground shadow-md transition-[left,background-color,color] duration-300 ease-in-out hover:bg-gold hover:text-primary-text ${
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
