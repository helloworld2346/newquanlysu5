import api from "@/lib/api";
import type {
  TrucNguoiPayload,
  TrucNguoiResponse,
  NguoiTrucListResponse,
} from "@/types/duty";

export const dutyApi = {
  getAllTrucChiHuy: () =>
    api
      .get<NguoiTrucListResponse>("/truc-chi-huy")
      .then((r) => r.data.Result ?? []),

  getAllTrucBanTacChien: () =>
    api
      .get<NguoiTrucListResponse>("/truc-ban-tac-chien")
      .then((r) => r.data.Result ?? []),

  createTrucChiHuy: (body: TrucNguoiPayload) =>
    api
      .post<TrucNguoiResponse>("/truc-chi-huy", body)
      .then((r) => r.data.Result),

  createTrucBanTacChien: (body: TrucNguoiPayload) =>
    api
      .post<TrucNguoiResponse>("/truc-ban-tac-chien", body)
      .then((r) => r.data.Result),

  updateTrucChiHuy: (id: string, body: TrucNguoiPayload) =>
    api
      .put<TrucNguoiResponse>(`/truc-chi-huy/${id}`, body)
      .then((r) => r.data.Result),

  updateTrucBanTacChien: (id: string, body: TrucNguoiPayload) =>
    api
      .put<TrucNguoiResponse>(`/truc-ban-tac-chien/${id}`, body)
      .then((r) => r.data.Result),

  deleteTrucChiHuy: (id: string) =>
    api.delete(`/truc-chi-huy/${id}`).then((r) => r.data),

  deleteTrucBanTacChien: (id: string) =>
    api.delete(`/truc-ban-tac-chien/${id}`).then((r) => r.data),
};
