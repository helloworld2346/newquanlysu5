import api from "@/lib/api";

export interface DonViItem {
  tenDonVi: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  tyLeHienDien: number;
}

export interface ThongKeQuanSoResult {
  ngayBaoCao: string;
  tongQuanSo: number;
  tongHienDien: number;
  tongVang: number;
  tyLeHienDien: number;
  tyLeVang: number;
  danhSachDonVi: DonViItem[];
}

interface ThongKeQuanSoResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ThongKeQuanSoResult;
}

export const executiveApi = {
  getThongKe: async (ngayBaoCao: string): Promise<ThongKeQuanSoResult> => {
    const res = await api.get<ThongKeQuanSoResponse>("/thong-ke", {
      params: { ngayBaoCao },
      skipErrorToast: true,
    });
    return res.data.Result;
  },
};
