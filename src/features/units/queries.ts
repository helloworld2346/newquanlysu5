import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { donviApi } from "./api";
import type { CreateDonViRequest, UpdateDonViRequest } from "@/types/account";

export const unitsKey = ["units"] as const;

export function useUnits() {
  return useQuery({ queryKey: unitsKey, queryFn: donviApi.getAll });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDonViRequest) => donviApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: unitsKey }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDonViRequest }) =>
      donviApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: unitsKey }),
  });
}
