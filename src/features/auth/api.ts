import api from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { AccountResponse } from "@/types/account";

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", body).then((r) => r.data),
  logout: (token: string) => api.post("/auth/logout", { token }),
  getAccount: () => api.get<AccountResponse>("/account").then((r) => r.data),
  changePassword: (matKhau: string) =>
    api
      .put<{ success: boolean; message: string }>("/auth/change-password", {
        matKhau,
      })
      .then((r) => r.data),
};
