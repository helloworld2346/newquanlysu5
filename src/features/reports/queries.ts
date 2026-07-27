import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "./api";
import type { CreateReportRequest } from "@/types/dailyReport";

export const reportsKey = (maDonVi: string, ngay: string) =>
  ["reports", maDonVi, ngay] as const;

export function useChildrenReports(maDonVi: string | undefined, ngay: string) {
  return useQuery({
    queryKey: reportsKey(maDonVi ?? "", ngay),
    queryFn: () => reportApi.searchChildren(maDonVi!, ngay),
    enabled: !!maDonVi && !!ngay,
    select: (res) => res.Result ?? [],
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateReportRequest }) =>
      reportApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}
