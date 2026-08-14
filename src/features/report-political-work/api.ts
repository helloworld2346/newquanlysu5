import api from "@/lib/api";
import type {
  PoliticalWorkRequest,
  PoliticalWorkForm,
  RefuseRequest,
  PoliticalWorkSingleResponse,
  PoliticalWorkListResponse,
} from "@/types/politicalWork";

export const politicalWorkApi = {
  create: async (
    payload: PoliticalWorkRequest,
  ): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.post<PoliticalWorkSingleResponse>(
      "/ctdangct",
      payload,
    );
    return res.data;
  },

  update: async (
    id: string,
    payload: PoliticalWorkForm,
  ): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/${id}`,
      payload,
    );
    return res.data;
  },

  getById: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.get<PoliticalWorkSingleResponse>(`/ctdangct/${id}`, {
      skipErrorToast: true,
    });
    return res.data;
  },

  getByDonVi: async (
    idDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao?: "DON_VI" | "TONG_HOP",
  ): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.get<PoliticalWorkSingleResponse>(
      `/ctdangct/search/DonVi/${idDonVi}`,
      {
        params: { ngayLoc, ...(loaiDonBaoCao ? { loaiDonBaoCao } : {}) },
        skipErrorToast: true,
      },
    );
    return res.data;
  },

  getByDonViChildren: async (
    idDonVi: string,
    ngayLoc: string,
    loaiDonBaoCao?: "DON_VI" | "TONG_HOP",
  ): Promise<PoliticalWorkListResponse> => {
    const res = await api.get<PoliticalWorkListResponse>(
      `/ctdangct/search/DonVi/${idDonVi}/children`,
      {
        params: { ngayLoc, ...(loaiDonBaoCao ? { loaiDonBaoCao } : {}) },
        skipErrorToast: true,
      },
    );
    return res.data;
  },

  submit: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/waiting-approve/${id}`,
    );
    return res.data;
  },

  recall: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/draft/${id}`,
    );
    return res.data;
  },

  approve: async (id: string): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/approve/${id}`,
    );
    return res.data;
  },

  refuse: async (
    id: string,
    body: RefuseRequest,
  ): Promise<PoliticalWorkSingleResponse> => {
    const res = await api.put<PoliticalWorkSingleResponse>(
      `/ctdangct/refuse/${id}`,
      body,
    );
    return res.data;
  },
};
