export type LoaiDonBaoCao = "DON_VI" | "TONG_HOP";

export interface TrucNguoiInfo {
  idNguoitruc?: string;
  tenNguoitruc: string;
  capbacNguoitruc: string;
  chucvuNguoitruc: string;
  sodienthoai: string;
}

export interface VangChiTiet {
  hoiThaiNgoaiSuDoan: number;
  hoiThaiEF: number;
  xayDungNgoaiSuDoan: number;
  xayDungEF: number;
  choHuu: number;
  nghiTranhThu: number;
  phep: number;
  vienNgoaiSuDoan: number;
  vienEF: number;
  congTacNgoaiSuDoan: number;
  congTacSuDoan: number;
  hocSQ: number;
  hocCS: number;
  lyDoVangKhac: number;
}

export interface AbsentRow {
  id: string;
  hoTen: string;
  capBac: string;
  chucVu: string;
  lyDoVang: keyof VangChiTiet | "";
  ghiChu: string;
  tenDonVi?: string;
}

export interface DetailStepData {
  securityStatus: string;
  incidentStatus: string;
  incidentDetail: string;
  advantageStatus: string;
  advantageDetail: string;
  disadvantageStatus: string;
  disadvantageDetail: string;
  pendingTaskStatus: string;
  pendingDetail: string;
}

export interface CreateReportRequest {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang?: string;
  donVi: string;
  trucBanChiHuy?: string;
  trucBanTacChien?: string;
  tinhHinhHoatDong?: string;
  loaiDonBaoCao?: LoaiDonBaoCao;
  chuKySo?: string;
}

export interface RefuseRequest {
  lyDoTuChoi: string;
}

export interface ActionResponse {
  success: boolean;
  code: number;
  message: string;
  Result?: ReportItemDTO;
}

export interface ReportItemDTO {
  idDonBaoCao: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  status: string;
  chuKySo?: string | null;
  ghiChu?: string | null;
  thoiGianBaoCao: string;
  thongTinVang: string;
  chiTietVang?: string;
  trucBanChiHuy?: string;
  trucBanTacChien?: string;
  tinhHinhHoatDong?: string;
  donVi: { maDonVi: string; tenDonvi: string; kyhieuDonvi?: string };
  loaiDonBaoCao?: LoaiDonBaoCao;
}

export interface ReportResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ReportItemDTO;
}

export interface SearchChildrenResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ReportItemDTO[];
}

export interface ReportRow {
  idDonBaoCao: string;
  donVi: string;
  tenDonVi: string;
  kyhieuDonVi?: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  vang: VangChiTiet;
  chiTietVangList: AbsentRow[];
  status: string;
  ghiChu: string;
  notSubmitted?: boolean;
  raw: ReportItemDTO | null;
}

export interface NhiemVuNgay {  
  idNhiemvuNgay: string;  
  nhiemVuPhandoi: string;  
  noiDungDotXuat: string;  
  noiDungUuDiem: string;  
  noiDungKhuyetDiem: string;  
  noiDungCanGiaiQuyet: string;  
}  
  
export interface NhiemVuNgayPayload {  
  nhiemVuPhandoi: string;  
  noiDungDotXuat: string;  
  noiDungUuDiem: string;  
  noiDungKhuyetDiem: string;  
  noiDungCanGiaiQuyet: string;  
  donBaoCao: string;  
}

export interface TrucNguoiCaTruc {  
  idNguoitruc?: string;  
  tenNguoitruc?: string;  
  capbacNguoitruc?: string;  
  chucvuNguoitruc?: string;  
  sodienthoai?: string;  
}  
  
export interface ReportDetailResult {  
  idDonBaoCao: string;  
  quanSoTong: number;  
  quanSoHienDien: number;  
  quanSoVang: number;  
  ghiChu?: string | null;  
  chiTietVang?: string;  
  trucBanChiHuy?: string;  
  trucBanTacChien?: string;  
  status: string;  
  chuKySo?: string;  
  thoiGianBaoCao: string;  
  loaiDonBaoCao?: LoaiDonBaoCao;  
  thongTinVang: string;  
  tinhHinhHoatDong?: string;  
  caTruc?: {  
    idCatruc?: string;  
    ngaytruc?: string;  
    trucBanTacChien?: TrucNguoiCaTruc;  
    trucChiHuy?: TrucNguoiCaTruc;  
  };  
  donVi: {  
    maDonVi: string;  
    tenDonvi: string;  
    kyhieuDonvi?: string;  
    capDonVi?: string;  
  };  
}  
  
export interface ReportDetailResponse {  
  success: boolean;  
  code: number;  
  message: string;  
  Result: ReportDetailResult;  
}