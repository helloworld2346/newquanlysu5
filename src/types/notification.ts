export interface ApiNotification {
  idThongbao: string;
  tieuDe: string;
  noiDung: string;
  thoiGian?: string;
  daDoc: boolean;
  loaiThongBao?: string;
}

export interface NotificationListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ApiNotification[];
}

// Kiểu dùng cho UI
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string; // ISO string
  isRead: boolean;
}
