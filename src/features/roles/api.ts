import api from "@/lib/api";
import type { Role } from "@/types/account";

interface RoleListResponse {
  success: boolean;
  Result: Role[];
}
interface RoleItemResponse {
  success: boolean;
  message?: string;
  Result: Role;
}

export interface RolePayload {
  tenVaiTro: string;
  tenChucnang: string[];
}

export const roleApi = {
  getAll: () =>
    api.get<RoleListResponse>("/vaitro").then((r) => r.data.Result ?? []),

  create: (body: RolePayload) =>
    api.post<RoleItemResponse>("/vaitro", body).then((r) => r.data.Result),

  update: (id: string, body: RolePayload) =>
    api.put<RoleItemResponse>(`/vaitro/${id}`, body).then((r) => r.data.Result),

  remove: (id: string) => api.delete(`/vaitro/${id}`).then((r) => r.data),
};
