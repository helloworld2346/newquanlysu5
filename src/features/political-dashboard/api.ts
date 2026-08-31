import api from "@/lib/api";

export interface PoliticalDashboardUnit {
  idDonVi: string;
  tenDonVi: string;
  soKienNghi: number;
  soDotXuat: number;
  tongVanDe: number;
  mucDo: string;
  updateAt?: string;
  updatedAt?: string;
}

export interface PoliticalDashboardResult {
  tongDonVi: number;
  donViCoKienNghi: number;
  donViCoDotXuat: number;
  danhSachDonVi: PoliticalDashboardUnit[];
}

interface PoliticalDashboardResponse {
  success: boolean;
  code: number;
  message: string;
  Result: PoliticalDashboardResult;
}

export const politicalDashboardApi = {
  getThongKeCtDangCt: async (
    date: string,
  ): Promise<PoliticalDashboardResult> => {
    const res = await api.get<PoliticalDashboardResponse>(
      "/thong-ke/ctDangCt",
      {
        params: { date },
        skipErrorToast: true,
      },
    );
    return res.data.Result;
  },
};
