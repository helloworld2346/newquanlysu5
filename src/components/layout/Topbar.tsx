import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { useAuthInfo, useLogout } from "@/features/auth/queries";
import { useTheme } from "@/shared/hooks/useTheme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar() {
  const { account } = useAuthInfo();
  const logout = useLogout();
  const { dark, toggle } = useTheme();

  const displayName =
    account?.tenTaiKhoan || account?.tenDangNhap || "Người dùng";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label="Chuyển chế độ sáng/tối"
        title={dark ? "Chế độ sáng" : "Chế độ tối"}
        className="mr-2 grid size-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-accent"
      >
        {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>

      <button
        type="button"
        aria-label="Thông báo"
        title="Thông báo"
        className="relative mr-4 grid size-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-accent"
      >
        <Bell className="size-5" />
        <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          3
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Tài khoản"
            className="flex items-center rounded-full outline-none hover:opacity-90"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2 max-w-[10rem] truncate text-sm font-medium text-foreground">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate">
            {displayName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
