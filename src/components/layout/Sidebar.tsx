import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { useAuthInfo } from "@/features/auth/queries";
import { getNavGroupsByRole } from "@/config/navigation";
import logo from "@/assets/images/logo-su5.png";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs bg-gold font-medium text-primary shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { account, role, capDonVi, tenChucnang } = useAuthInfo();
  const unitName = account?.donVi?.tenDonvi || "Chưa phân đơn vị";
  const sections = getNavGroupsByRole(role || null, capDonVi, tenChucnang);

  const textAnim = `overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
    collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[12rem] opacity-100"
  }`;

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-full w-full flex-col bg-primary text-primary-foreground">
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
          <div className={textAnim}>
            <p className="truncate text-base font-bold uppercase text-gold">
              {unitName}
            </p>
            <p className="truncate text-xs text-primary-foreground/70">
              Thống kê quân số,
            </p>
            <p className="truncate text-xs text-primary-foreground/70">
              Hoạt động CTĐ, CTCT
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">
          {sections.map((sec, i) => (
            <div key={sec.id} className={i === 0 ? "" : "mt-4"}>
              <p
                className={`pb-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground/60 transition-all duration-300 ease-in-out ${
                  collapsed
                    ? "px-1 text-center text-[10px] leading-tight"
                    : "px-3"
                }`}
              >
                {sec.label}
              </p>

              <div className="space-y-1">
                {sec.items.map(({ path, label, icon: Icon }) => {
                  const linkContent = (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) =>
                        `flex items-center rounded-lg py-2 text-sm transition-colors ${
                          collapsed ? "justify-center px-2" : "pl-6 pr-3"
                        } ${
                          isActive
                            ? "bg-gold font-medium text-primary"
                            : "text-primary-foreground/80 hover:bg-gold/20 hover:text-gold"
                        }`
                      }
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className={`truncate ${textAnim}`}>{label}</span>
                    </NavLink>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={path}>
                        <TooltipTrigger asChild>
                          <div>{linkContent}</div>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkContent;
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
