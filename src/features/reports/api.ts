import api from "@/lib/api";
import type {
  CreateReportRequest,
  ReportResponse,
  SearchChildrenResponse,
  NhiemVuNgay,
  NhiemVuNgayPayload,
  ReportDetailResponse,
  RefuseRequest,
  ActionResponse,
  ApproveResponse,
} from "@/types/dailyReport";  

export const reportApi = {
  searchByUnitAndDate: async (
    maDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao: "DON_VI" | "TONG_HOP" = "DON_VI",
  ): Promise<ReportResponse> => {
    const res = await api.get<ReportResponse>(
      `/donbaocao/search/DonVi/${maDonVi}`,
      { params: { ngayLoc, loaiDonBaoCao }, skipErrorToast: true },
    );
    return res.data;
  },

  searchChildren: async (
    maDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao: "DON_VI" | "TONG_HOP" = "DON_VI",
  ): Promise<SearchChildrenResponse> => {
    const res = await api.get<SearchChildrenResponse>(
      `/donbaocao/search/DonVi/${maDonVi}/children`,
      { params: { ngayLoc, loaiDonBaoCao }, skipErrorToast: true },
    );
    return res.data;
  },

  create: async (payload: CreateReportRequest): Promise<ReportResponse> => {
    const res = await api.post<ReportResponse>("/donbaocao", payload);
    return res.data;
  },

  update: async (
    id: string,
    payload: CreateReportRequest,
  ): Promise<ReportResponse> => {
    const res = await api.put<ReportResponse>(`/donbaocao/${id}`, payload);
    return res.data;
  },

  getNhiemVuByDonBaoCao: async (
    idDonBaoCao: string,
  ): Promise<{ success: boolean; Result: NhiemVuNgay | null }> => {
    const res = await api.get(`/nhiemvungay/donbaocao/${idDonBaoCao}`, {
      skipErrorToast: true,
    });
    return res.data;
  },

  createNhiemVu: async (payload: NhiemVuNgayPayload) => {
    const res = await api.post(`/nhiemvungay`, payload);
    return res.data;
  },

  updateNhiemVu: async (id: string, payload: NhiemVuNgayPayload) => {
    const res = await api.put(`/nhiemvungay/${id}`, payload);
    return res.data;
  },

  getById: async (id: string): Promise<ReportDetailResponse> => {
    const res = await api.get<ReportDetailResponse>(`/donbaocao/${id}`, {
      skipErrorToast: true,
    });
    return res.data;
  },

  submit: async (id: string): Promise<ApproveResponse> => {
    const res = await api.put<ApproveResponse>(
      `/donbaocao/submit/${id}`,
      null,
      { params: { id } },
    );
    return res.data;
  },

  recall: async (id: string): Promise<ActionResponse> => {
    const res = await api.put<ActionResponse>(`/donbaocao/recall/${id}`, null, {
      params: { id },
    });
    return res.data;
  },

  approve: async (id: string): Promise<ActionResponse> => {
    const res = await api.put<ActionResponse>(`/donbaocao/approve/${id}`);
    return res.data;
  },

  refuse: async (id: string, body: RefuseRequest): Promise<ActionResponse> => {
    const res = await api.put<ActionResponse>(`/donbaocao/refuse/${id}`, body);
    return res.data;
  },
};
