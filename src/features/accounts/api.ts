import api from "@/lib/api";
import type {
  Account,
  AccountResponse,
  AccountListResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateChucNangRequest,
  DonVi,
  Role,
} from "@/types/account";

interface DonViListResponse {
  success: boolean;
  Result: DonVi[];
}
interface RoleListResponse {
  success: boolean;
  Result: Role[];
}

export const accountApi = {
  getAll: () =>
    api.get<AccountListResponse>("/account/getAll").then((r) => r.data.Result),

  getDonVi: () =>
    api.get<DonViListResponse>("/donvi").then((r) => r.data.Result),

  getRoles: () =>
    api.get<RoleListResponse>("/vaitro").then((r) => r.data.Result),

  create: (body: CreateAccountRequest) =>
    api.post<AccountResponse>("/account", body).then((r) => r.data.Result),

  update: (id: string, body: UpdateAccountRequest) =>
    api.put<AccountResponse>(`/account/${id}`, body).then((r) => r.data.Result),

  remove: (id: string) => api.delete(`/account/${id}`).then((r) => r.data),

  lock: (id: string) =>
    api.put<AccountResponse>(`/account/${id}/lock`).then((r) => r.data.Result),

  unlock: (id: string) =>
    api
      .put<AccountResponse>(`/account/${id}/unlock`)
      .then((r) => r.data.Result),

  resetPassword: async (id: string, matKhauMoi: string): Promise<void> => {
    await api.put(`/account/${id}/reset-password`, { matKhauMoi });
  },

  updateChucNang: async (
    id: string,
    data: UpdateChucNangRequest,
  ): Promise<AccountResponse> => {
    const res = await api.put<AccountResponse>(`/account/${id}/chucnang`, data);
    return res.data;
  },
};

export type { Account };
