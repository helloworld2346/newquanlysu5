import { NavLink } from "react-router-dom";
import { useAuthInfo } from "@/features/auth/queries";
import { getNavItemsByRole } from "@/config/navigation";
import { useLogout } from "@/features/auth/queries";

export default function Sidebar() {
  const { role, capDonVi, tenChucnang } = useAuthInfo();
  const logout = useLogout();
  const items = getNavItemsByRole(role || null, capDonVi, tenChucnang);

  return (
    <aside className="w-60 border-r bg-card p-3">
      <nav className="space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.path}
            to={it.path}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="mt-4 w-full rounded-md border px-3 py-2 text-sm"
      >
        Đăng xuất
      </button>
    </aside>
  );
}
