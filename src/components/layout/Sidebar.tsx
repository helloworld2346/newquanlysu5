import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthInfo, useLogout } from "@/features/auth/queries";
import { getNavGroupsByRole } from "@/config/navigation";
import logo from "@/assets/images/logo-su5.png";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { account, role, capDonVi, tenChucnang } = useAuthInfo();
  const unitName = account?.donVi?.tenDonvi || "Chưa phân đơn vị";
  const logout = useLogout();
  const sections = getNavGroupsByRole(role || null, capDonVi, tenChucnang);

  return (
    <aside className="flex h-full flex-col bg-primary text-primary-foreground">
      {/* Header brand */}
      <div className="flex h-16 shrink-0 items-center px-4 pt-6">
        <img
          src={logo}
          alt="Logo"
          className="size-16 shrink-0 object-contain"
        />
        {!collapsed && (
          <span className="ml-4 truncate text-lg font-bold uppercase text-gold">
            {unitName}
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3 pt-10">
        {sections.map((sec, i) => (
          <div key={sec.id} className={i === 0 ? "" : "mt-6"}>
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground/60">
                {sec.label}
              </p>
            )}
            <div className="space-y-1">
              {sec.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg py-2.5 text-sm transition-colors ${
                      collapsed ? "justify-center px-2" : "pl-6 pr-3"
                    } ${
                      isActive
                        ? "bg-gold font-medium text-primary"
                        : "text-primary-foreground/80 hover:bg-gold/20 hover:text-gold"
                    }`
                  }
                >
                  <Icon
                    className={
                      collapsed ? "size-5 shrink-0" : "mr-3 size-5 shrink-0"
                    }
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Đăng xuất */}
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Đăng xuất" : undefined}
          className={`flex w-full items-center rounded-lg border border-white/20 py-2.5 text-sm text-primary-foreground hover:bg-gold/20 hover:text-gold ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <LogOut
            className={collapsed ? "size-5 shrink-0" : "mr-3 size-5 shrink-0"}
          />
          {!collapsed && "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
