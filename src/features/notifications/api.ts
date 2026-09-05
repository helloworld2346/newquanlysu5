import api from "@/lib/api";
import type { NotificationListResponse } from "@/types/notification";

export const notificationApi = {
  getNotifications: async (
    maDonVi: string,
  ): Promise<NotificationListResponse> => {
    const res = await api.get<NotificationListResponse>(`/thongbao/${maDonVi}`);
    return res.data;
  },

  deleteReadNotifications: async (maDonVi: string): Promise<void> => {
    await api.delete(`/thongbao/dadoc/${maDonVi}`);
  },
};
