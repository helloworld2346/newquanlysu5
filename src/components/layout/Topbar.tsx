import {
  Bell,
  BellOff,
  Moon,
  Sun,
  LogOut,
  CheckCheck,
  Trash2,
} from "lucide-react";
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
              <span className="absolute -right-0.5 -top-0.5 grid size-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[22rem] overflow-hidden p-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <div className="flex items-baseline gap-2">
              <DropdownMenuLabel className="p-0 text-[15px] font-semibold">
                Thông báo
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
              >
                <CheckCheck className="size-3.5" /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <DropdownMenuSeparator className="my-0" />

          {/* List */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <BellOff className="size-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Chưa có thông báo
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Thông báo mới sẽ xuất hiện ở đây
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[24rem] overflow-y-auto py-1">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`relative flex cursor-pointer flex-col items-stretch gap-1 rounded-lg px-4 py-2.5 focus:bg-accent ${
                    n.isRead ? "" : "bg-primary/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        n.isRead ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <p
                      className={`flex-1 truncate text-sm ${
                        n.isRead
                          ? "font-medium text-foreground/90"
                          : "font-semibold text-foreground"
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                      {formatRelativeTime(n.time)}
                    </span>
                  </div>
                  {n.message && (
                    <p className="line-clamp-2 whitespace-normal pl-3.5 text-xs leading-relaxed text-muted-foreground">
                      {n.message}
                    </p>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {/* Footer */}
          {hasRead && (
            <>
              <DropdownMenuSeparator className="my-0" />
              <button
                type="button"
                onClick={clearRead}
                className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Trash2 className="size-3.5" /> Xóa thông báo đã đọc
              </button>
            </>
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
