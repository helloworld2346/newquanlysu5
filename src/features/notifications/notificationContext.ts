import { createContext, useContext } from "react";
import type { AppNotification } from "@/types/notification";

export type NotificationCtx = {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearRead: () => void;
};

export const NotificationContext = createContext<NotificationCtx | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
}
