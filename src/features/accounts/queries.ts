import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "./api";
import type {
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdateChucNangRequest,
} from "@/types/account";

const accountsKey = ["accounts"] as const;

export function useAccounts() {
  return useQuery({ queryKey: accountsKey, queryFn: accountApi.getAll });
}

export function useDonViList() {
  return useQuery({ queryKey: ["donvi"], queryFn: accountApi.getDonVi });
}

export function useRoleList() {
  return useQuery({ queryKey: ["roles"], queryFn: accountApi.getRoles });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAccountRequest) => accountApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: UpdateAccountRequest }) =>
      accountApi.update(v.id, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}

export function useToggleLock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; locked: boolean }) =>
      v.locked ? accountApi.unlock(v.id) : accountApi.lock(v.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, matKhauMoi }: { id: string; matKhauMoi: string }) =>
      accountApi.resetPassword(id, matKhauMoi),
  });
}

export function useUpdateChucNang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChucNangRequest }) =>
      accountApi.updateChucNang(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountsKey }),
  });
}
