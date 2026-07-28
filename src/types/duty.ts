export interface TrucNguoiPayload {
  tenNguoitruc: string;
  capbacNguoitruc: string;
  chucvuNguoitruc: string;
  sodienthoai: string;
}

export interface NguoiTrucDetail {
  idNguoitruc: string;
  tenNguoitruc: string;
  capbacNguoitruc: string;
  chucvuNguoitruc: string;
  sodienthoai: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface NguoiTrucWithCaTruc extends NguoiTrucDetail {
  caTruc: unknown[];
}

export interface TrucNguoiResponse {
  success: boolean;
  code: number;
  message: string;
  Result: NguoiTrucDetail;
}

export interface NguoiTrucListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: NguoiTrucWithCaTruc[];
}
