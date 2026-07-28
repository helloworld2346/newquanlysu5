import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleApi, type RolePayload } from "./api";

const rolesKey = ["roles"] as const;

export function useRoles() {
  return useQuery({ queryKey: rolesKey, queryFn: roleApi.getAll });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RolePayload) => roleApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: RolePayload }) =>
      roleApi.update(v.id, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  });
}
