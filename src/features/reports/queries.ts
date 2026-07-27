import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueries } from "@tanstack/react-query";
import { reportApi } from "./api";
import type { CreateReportRequest, ReportItemDTO } from "@/types/dailyReport";

export const reportsKey = (maDonVi: string, ngay: string) =>
  ["reports", maDonVi, ngay] as const;

const TONG_HOP_CAPS = ["PHONG", "TRUNG_DOAN", "TIEU_DOAN"];

export function useChildrenReports(maDonVi: string | undefined, ngay: string) {
  return useQuery({
    queryKey: reportsKey(maDonVi ?? "", ngay),
    queryFn: () => reportApi.searchChildren(maDonVi!, ngay),
    enabled: !!maDonVi && !!ngay,
    select: (res) => res.Result ?? [],
  });
}

export function useChildrenReportsMerged(
  maDonVi: string | undefined,
  ngay: string,
  capByUnit: Record<string, string | null | undefined>,
) {
  const donViQuery = useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "DON_VI"],
    queryFn: () => reportApi.searchChildren(maDonVi!, ngay, "DON_VI"),
    enabled: !!maDonVi && !!ngay,
    select: (res) => res.Result ?? [],
  });

  const tongHopQuery = useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "TONG_HOP"],
    queryFn: () => reportApi.searchChildren(maDonVi!, ngay, "TONG_HOP"),
    enabled: !!maDonVi && !!ngay,
    select: (res) => res.Result ?? [],
  });

  const data = useMemo(() => {
    const map = new Map<string, ReportItemDTO>();
    for (const item of donViQuery.data ?? []) {
      const ma = item.donVi.maDonVi;
      const cap = capByUnit[ma] ?? "";
      if (TONG_HOP_CAPS.includes(cap)) continue;
      map.set(ma, item);
    }

    for (const item of tongHopQuery.data ?? []) {
      const ma = item.donVi.maDonVi;
      const cap = capByUnit[ma] ?? "";
      const isAggregating = TONG_HOP_CAPS.includes(cap);
      if (isAggregating || !map.has(ma)) {
        map.set(ma, item);
      }
    }

    return Array.from(map.values());
  }, [donViQuery.data, tongHopQuery.data, capByUnit]);

  return {
    data,
    isLoading: donViQuery.isLoading || tongHopQuery.isLoading,
  };
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

export function useNhiemVuNgayByReports(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["nhiemvungay", id],
      queryFn: () => reportApi.getNhiemVuByDonBaoCao(id),
      enabled: !!id,
      staleTime: 60_000,
    })),
  });
}