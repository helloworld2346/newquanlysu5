import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { storage } from "@/lib/storage";
import { normalizeRoleName } from "@/lib/roles";

export const accountKey = ["account"] as const;

export function useAccount() {
  return useQuery({
    queryKey: accountKey,
    queryFn: authApi.getAccount,
    enabled: !!storage.getToken(),
    select: (res) => res.Result,
    staleTime: 5 * 60_000,
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      if (res.success && res.Result?.token) {
        storage.setToken(res.Result.token);
        qc.invalidateQueries({ queryKey: accountKey });
      }
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return async () => {
    const token = storage.getToken();
    try {
      if (token) await authApi.logout(token);
    } finally {
      storage.removeToken();
      storage.clearNavState();
      qc.clear();
      window.location.href = "/login";
    }
  };
}

export function useAuthInfo() {
  const { data: account, isLoading } = useAccount();
  const role = normalizeRoleName(account?.vaiTro?.tenVaiTro ?? undefined);
  const capDonVi = account?.donVi?.capDonVi ?? null;
  const tenChucnang = (
    account?.tenChucnang ??
    account?.vaiTro?.tenChucnang ??
    []
  ).filter((c) => c && c.trim() !== "");
  return { account, role, capDonVi, tenChucnang, isLoading };
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (matKhau: string) => authApi.changePassword(matKhau),
  });
}
