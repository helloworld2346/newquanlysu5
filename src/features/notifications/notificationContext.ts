import { createContext, useContext } from "react";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  createdAt: number;
  read: boolean;
};

export type NotificationCtx = {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clear: () => void;
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
