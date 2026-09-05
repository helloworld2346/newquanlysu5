import { Bell, Moon, Sun, LogOut, Check, Trash2 } from "lucide-react";
import { useAuthInfo, useLogout } from "@/features/auth/queries";
import { useTheme } from "@/shared/hooks/useTheme";
import { useNotifications } from "@/features/notifications/notificationContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export default function Topbar() {
  const { account } = useAuthInfo();
  const logout = useLogout();
  const { dark, toggle } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, clearRead } =
    useNotifications();

  const displayName =
    account?.tenTaiKhoan || account?.tenDangNhap || "Người dùng";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";
  const hasRead = notifications.some((n) => n.isRead);

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Thông báo"
            title="Thông báo"
            className="relative mr-4 grid size-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-accent"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="p-0">Thông báo</DropdownMenuLabel>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  title="Đánh dấu tất cả đã đọc"
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Check className="size-3.5" /> Đọc tất cả
                </button>
              )}
              {hasRead && (
                <button
                  type="button"
                  onClick={clearRead}
                  title="Xóa thông báo đã đọc"
                  className="grid size-6 place-items-center rounded text-rose-600 hover:bg-accent dark:text-rose-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />

          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Không có thông báo nào
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex flex-col items-start gap-0.5 whitespace-normal"
                >
                  <span className="flex w-full items-center gap-1.5">
                    {!n.isRead && (
                      <span className="size-2 shrink-0 rounded-full bg-red-500" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {n.title}
                    </span>
                  </span>
                  {n.message && (
                    <span className="text-xs text-muted-foreground">
                      {n.message}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(n.time)}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
