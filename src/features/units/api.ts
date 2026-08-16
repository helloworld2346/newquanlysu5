import api from "@/lib/api";
import type {
  DonVi,
  DonViResponse,
  CreateDonViRequest,
  CreateDonViResponse,
  UpdateDonViRequest,
  UpdateDonViResponse,
  QuanSoBienCheResult,
  QuanSoBienCheResponse,
} from "@/types/account";

export const donviApi = {
  getAll: async (): Promise<DonVi[]> => {
    const res = await api.get<DonViResponse>("/donvi");
    return res.data.Result;
  },
  create: async (data: CreateDonViRequest): Promise<CreateDonViResponse> => {
    const res = await api.post<CreateDonViResponse>("/donvi", data);
    return res.data;
  },
  update: async (
    maDonVi: string,
    data: UpdateDonViRequest,
  ): Promise<UpdateDonViResponse> => {
    const res = await api.put<UpdateDonViResponse>(
      `/donvi/update/${maDonVi}`,
      data,
    );
    return res.data;
  },
  getQuanSoBienChe: async (maDonVi: string): Promise<QuanSoBienCheResult> => {
    const res = await api.get<QuanSoBienCheResponse>(
      `/donvi/${maDonVi}/quansobienche`,
    );
    return res.data.Result;
  },
};
