export interface Role {  
  idVaiTro: string | null;  
  tenVaiTro: string | null;  
  tenChucnang?: string[];  
}

export interface DonVi {  
  maDonVi: string;  
  tenDonvi: string;  
  donViCha: string | null;  
  donViCon: string[];  
  kyhieuDonvi: string;  
  capDonVi?: string | null;  
  quanSoHsqBs: number;  
  quanSoQncn: number;  
  quanSoSiQuan: number;  
  quanSoTong: number;  
  createdAt?: string;  
  updatedAt?: string;  
  isDeleted?: boolean;  
  deletedAt?: string | null;  
}  
  
export interface DonViResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: DonVi[];  
}  
  
export interface CreateDonViRequest {  
  tenDonvi: string;  
  kyhieuDonvi: string;  
  quanSoTong: number;  
  quanSoHsqBs: number;  
  quanSoSiQuan: number;  
  quanSoQncn: number;  
  donViCha: string;  
  capDonVi: string;  
  donViCon: string[];  
}  
  
export interface CreateDonViResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: DonVi;  
}  
  
export interface UpdateDonViRequest {  
  tenDonvi: string;  
  kyhieuDonvi: string;  
  capDonVi: string;  
  donViCha: string | null;  
  quanSoTong: number;  
  quanSoHsqBs: number;  
  quanSoSiQuan: number;  
  quanSoQncn: number;  
  createdAt?: string;  
  updatedAt?: string;  
  isDeleted?: boolean;  
  deletedAt?: string | null;  
}  
  
export interface UpdateDonViResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: DonVi;  
}
export interface Account {  
  idTaiKhoan: string;  
  tenDangNhap: string;  
  tenTaiKhoan: string;  
  vaiTro: Role;  
  donVi?: DonVi;  
  khoa: boolean;  
  tenChucnang?: string[];  
}  
export interface AccountResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: Account;  
}