import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storage } from "@/lib/storage";
import { wsClient } from "@/lib/ws";
import { useAccount } from "@/features/auth/queries";
import { notificationApi } from "./api";
import { NotificationContext } from "./notificationContext";
import type { ApiNotification, AppNotification } from "@/types/notification";

function mapApiNotification(n: ApiNotification): AppNotification {
  return {
    id: n.idThongbao,
    title: n.tieuDe,
    message: n.noiDung,
    time: n.thoiGian ?? new Date().toISOString(),
    isRead: n.daDoc,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data: account } = useAccount();
  const maDonVi = account?.donVi?.maDonVi;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // 1) Tải danh sách ban đầu qua REST
  useEffect(() => {
    if (!maDonVi) return;
    let active = true;
    notificationApi
      .getNotifications(maDonVi)
      .then((res) => {
        if (active)
          setNotifications((res.Result ?? []).map(mapApiNotification));
      })
      .catch(() => {
        /* lỗi đã được interceptor toast */
      });
    return () => {
      active = false;
    };
  }, [maDonVi]);

  // 2) Nối WebSocket + REGISTER + nhận message
  useEffect(() => {
    if (!account) return;

    wsClient.setOnOpen(() => {
      wsClient.send({
        type: "REGISTER",
        role: account.vaiTro?.idVaiTro ?? "",
        donViId: account.donVi?.maDonVi ?? "",
        userId: account.idTaiKhoan,
        token: storage.getToken() ?? "",
      });
    });

    wsClient.setOnMessage((data) => {
      const msg = data as {
        type?: string;
        title?: string;
        message?: string;
        id?: string;
      };

      if (msg.type === "FORCE_LOGOUT") {
        wsClient.disconnect();
        setTimeout(() => {
          storage.removeToken();
          storage.clearNavState();
          window.location.href = "/login";
        }, 2500);
        return;
      }

      if (msg.title || msg.message) {
        const newNotif: AppNotification = {
          id: msg.id ?? `${Date.now()}`,
          title: msg.title ?? "",
          message: msg.message ?? "",
          time: new Date().toISOString(),
          isRead: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);

        const text = `${msg.title ?? ""}${msg.message ? `: ${msg.message}` : ""}`;
        if (msg.type === "URGENT" || msg.type === "WARNING") toast.error(text);
        else if (msg.title) toast.success(text);
      }

      // Làm mới dữ liệu liên quan
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["ca-truc"] });
    });

    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, [account, qc]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearRead = useCallback(async () => {
    if (maDonVi) {
      try {
        await notificationApi.deleteReadNotifications(maDonVi);
      } catch {
        /* interceptor đã toast */
      }
    }
    setNotifications((prev) => prev.filter((n) => !n.isRead));
  }, [maDonVi]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, clearRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
