// src/types/account.ts  
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