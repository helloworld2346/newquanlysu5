import { NavLink } from "react-router-dom";
import { useAuthInfo } from "@/features/auth/queries";
import { getNavGroupsByRole } from "@/config/navigation";
import logo from "@/assets/images/logo-su5.png";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { account, role, capDonVi, tenChucnang } = useAuthInfo();
  const unitName = account?.donVi?.tenDonvi || "Chưa phân đơn vị";
  const sections = getNavGroupsByRole(role || null, capDonVi, tenChucnang);

  const textAnim = `overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
    collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[12rem] opacity-100"
  }`;

  return (
    <aside className="flex h-full w-full flex-col bg-primary text-primary-foreground">
      <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-4">
        <img
          src={logo}
          alt="Logo SƯ ĐOÀN 5"
          className="size-14 shrink-0 object-contain"
          draggable={false}
        />
        <span
          className={`truncate text-lg font-bold uppercase text-gold ${textAnim}`}
        >
          {unitName}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {sections.map((sec, i) => (
          <div key={sec.id} className={i === 0 ? "" : "mt-6"}>
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
              {sec.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
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
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
