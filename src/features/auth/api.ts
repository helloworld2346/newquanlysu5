import api from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { AccountResponse } from "@/types/account";

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", body).then((r) => r.data),
  logout: (token: string) => api.post("/auth/logout", { token }),
  getAccount: () => api.get<AccountResponse>("/account").then((r) => r.data),
};
