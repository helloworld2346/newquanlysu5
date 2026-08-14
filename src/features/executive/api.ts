import api from "@/lib/api";
import type { VangChiTiet } from "@/types/dailyReport";

export interface DonViItem {
  tenDonVi: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  tyLeHienDien: number;
}

export interface CoCauLoai {
  bienChe: number;
  hienDien: number;
  vang: number;
}
export interface CoCauQuanSo {
  siQuan: CoCauLoai;
  qncn: CoCauLoai;
  hsqBs: CoCauLoai;
}

export interface ThongKeQuanSoResult {
  ngayBaoCao: string;
  tongQuanSo: number;
  tongHienDien: number;
  tongVang: number;
  tyLeHienDien: number;
  tyLeVang: number;
  danhSachDonVi: DonViItem[];
  tongHopVang?: VangChiTiet;
  coCauQuanSo?: CoCauQuanSo;
}

interface ThongKeQuanSoResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ThongKeQuanSoResult;
}

function isoToApiDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export const executiveApi = {
  getThongKe: async (ngayBaoCao: string): Promise<ThongKeQuanSoResult> => {
    const res = await api.get<ThongKeQuanSoResponse>("/thong-ke", {
      params: { ngayBaoCao: isoToApiDate(ngayBaoCao) },
      skipErrorToast: true,
    });
    return res.data.Result;
  },
};
