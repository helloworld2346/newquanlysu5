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

export interface CaTrucDetail {  
  idCatruc: string;  
  ngaytruc: string;  
  matkhau: string;  
  ghichu: string | null;  
  trucChiHuy: NguoiTrucDetail | null;  
  trucBanTacChien: NguoiTrucDetail | null;  
  isDeleted: boolean;  
  createdAt: string;  
  updatedAt: string | null;  
  deletedAt: string | null;  
}  
  
export interface CaTrucListResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: CaTrucDetail[];  
}  
  
export interface UpdateCaTrucPayload {  
  ngaytruc: string;  
  matkhau: string;  
  ghichu: string;  
  trucChiHuy: string;  
  trucBanTacChien: string;  
}  
  
export interface UpdateCaTrucResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: CaTrucDetail;  
}

export interface CaTrucPayload {  
  ngaytruc: string;  
  matkhau: string;  
  ghichu: string;  
  trucChiHuy: string;  
  trucBanTacChien: string;  
}  
  
export interface CaTrucCreateResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: CaTrucDetail;  
}  
  
export interface CaTrucDetailResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: CaTrucDetail;  
}  
  
export interface GetCaTrucByDateResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: CaTrucDetail | null;  
}