import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storage } from "@/lib/storage";
import { wsClient, type WsMessage } from "@/lib/ws";
import {
  NotificationContext,
  type AppNotification,
} from "./notificationContext";

// Ánh xạ type sự kiện -> tiêu đề hiển thị
const TITLE_MAP: Record<string, string> = {
  REPORT_SUBMITTED: "Có báo cáo mới được trình duyệt",
  REPORT_APPROVED: "Báo cáo đã được phê duyệt",
  REPORT_REFUSED: "Báo cáo bị trả về",
  DUTY_CREATED: "Có ca trực mới",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!storage.getToken()) return;

    wsClient.connect();

    const unsubscribe = wsClient.subscribe((msg: WsMessage) => {
      const title = TITLE_MAP[msg.type] ?? "Thông báo mới";

      setNotifications((prev) => [
        {
          id:
            (msg.payload as { id?: string })?.id ?? `${msg.type}-${Date.now()}`,
          type: msg.type,
          title,
          createdAt: Date.now(),
          read: false,
        },
        ...prev,
      ]);

      toast(title);

      // Làm mới dữ liệu liên quan
      if (msg.type.startsWith("REPORT_")) {
        qc.invalidateQueries({ queryKey: ["reports"] });
      }
      if (msg.type.startsWith("DUTY_")) {
        qc.invalidateQueries({ queryKey: ["ca-truc"] });
      }
    });

    // reconnect khi tab được focus lại
    const onFocus = () => wsClient.connect();
    window.addEventListener("focus", onFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [qc]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clear = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, clear }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
