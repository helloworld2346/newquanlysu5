import { NavLink } from "react-router-dom";
import { useAuthInfo } from "@/features/auth/queries";
import { getNavGroupsByRole } from "@/config/navigation";
import logo from "@/assets/images/logo-su5.png";
import waveline from "@/assets/images/waveline.jpg";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { account, role, capDonVi, tenChucnang } = useAuthInfo();
  const unitName = account?.donVi?.tenDonvi || "Chưa phân đơn vị";
  const sections = getNavGroupsByRole(role || null, capDonVi, tenChucnang);

  const textCls = `ml-3 overflow-hidden whitespace-nowrap ${
    collapsed ? "hidden" : ""
  }`;

  return (
    <aside
      className={`flex h-full flex-col bg-primary text-primary-foreground ${
        collapsed ? "w-full" : "w-72"
      }`}
    >
      <div
        className={`flex h-[96px] shrink-0 items-center ${
          collapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        <img
          src={logo}
          alt="Logo SƯ ĐOÀN 5"
          className="size-14 shrink-0 object-contain"
          draggable={false}
        />
        <div className={textCls}>
          <p className="truncate text-base font-bold uppercase text-gold">
            {unitName}
          </p>
          <p className="truncate text-sm text-primary-foreground/70">
            Thống kê quân số,
          </p>
          <p className="truncate text-sm text-primary-foreground/70">
            Hoạt động CTĐ, CTCT
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">
        {sections.map((sec, i) => (
          <div key={sec.id} className={i === 0 ? "" : "mt-4"}>
            <p
              className={`whitespace-nowrap pb-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground/60 ${
                collapsed
                  ? "px-1 text-center text-[10px] leading-tight"
                  : "px-3"
              }`}
            >
              {collapsed ? (sec.collapsedLabel ?? sec.label) : sec.label}
            </p>

            <div className="space-y-1">
              {sec.items.map(({ path, label, icon: Icon }) => {
                const link = (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `relative flex items-center overflow-hidden rounded-lg py-2 text-sm transition-colors ${
                        collapsed ? "justify-center px-2" : "pl-6 pr-3"
                      } ${
                        isActive
                          ? "bg-gold font-medium text-primary-text"
                          : "text-primary-foreground/80 hover:bg-gold/20 hover:text-gold"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: `url(${waveline})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }}
                          />
                        )}
                        <Icon className="relative z-10 size-5 shrink-0" />
                        <span className={`relative z-10 truncate ${textCls}`}>
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );

                return collapsed ? (
                  <Tooltip key={path}>
                    <TooltipTrigger asChild>
                      <div>{link}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      {label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  link
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
