import { useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { reportApi } from "./api";
import type {
  CreateReportRequest,
  ReportItemDTO,
  LoaiDonBaoCao,
} from "@/types/dailyReport";

export const reportsKey = (maDonVi: string, ngay: string) =>
  ["reports", maDonVi, ngay] as const;

export const TONG_HOP_CAPS = ["SU_DOAN", "TRUNG_DOAN", "TIEU_DOAN"];

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
  hasChildren = true,
  ready = true,
) {
  const baseEnabled = !!maDonVi && !!ngay && ready;

  const selfQuery = useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "SELF"],
    queryFn: () => reportApi.searchByUnitAndDate(maDonVi!, ngay, "DON_VI"),
    enabled: baseEnabled && !hasChildren,
    select: (res) => (res.Result ? [res.Result] : []),
  });

  const donViQuery = useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "DON_VI"],
    queryFn: () => reportApi.searchChildren(maDonVi!, ngay, "DON_VI"),
    enabled: baseEnabled && hasChildren,
    select: (res) => res.Result ?? [],
  });

  const tongHopQuery = useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "TONG_HOP"],
    queryFn: () => reportApi.searchChildren(maDonVi!, ngay, "TONG_HOP"),
    enabled: baseEnabled && hasChildren,
    select: (res) => res.Result ?? [],
  });

  const data = useMemo(() => {
    if (!hasChildren) {
      return selfQuery.data ?? [];
    }

    const allCodes = Object.keys(capByUnit);
    const unitHasChildren = (ma: string) =>
      allCodes.some((c) => c.startsWith(ma + "."));

    const map = new Map<string, ReportItemDTO>();

    for (const item of donViQuery.data ?? []) {
      const ma = item.donVi.maDonVi;
      const cap = capByUnit[ma] ?? "";
      const isAggregating = TONG_HOP_CAPS.includes(cap) && unitHasChildren(ma);
      const isSelf = ma === maDonVi;
      if (!isAggregating || isSelf) {
        map.set(ma, item);
      }
    }

    for (const item of tongHopQuery.data ?? []) {
      const ma = item.donVi.maDonVi;
      const cap = capByUnit[ma] ?? "";
      const isAggregating = TONG_HOP_CAPS.includes(cap) && unitHasChildren(ma);
      const isSelf = ma === maDonVi;
      if (isAggregating || isSelf || !map.has(ma)) {
        map.set(ma, item);
      }
    }

    return Array.from(map.values());
  }, [
    hasChildren,
    maDonVi,
    selfQuery.data,
    donViQuery.data,
    tongHopQuery.data,
    capByUnit,
  ]);

  return {
    data,
    isLoading: hasChildren
      ? donViQuery.isLoading || tongHopQuery.isLoading
      : selfQuery.isLoading,
  };
}

export function useTongHopReports(
  maDonVi: string | undefined,
  ngay: string,
  hasChildren = true,
) {
  return useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "TONG_HOP_TAB"],
    queryFn: () => reportApi.searchByUnitAndDate(maDonVi!, ngay, "TONG_HOP"),
    enabled: !!maDonVi && !!ngay && hasChildren,
    select: (res) => (res.Result ? [res.Result] : []),
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

export function useReportDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["report-detail", id],
    queryFn: () => reportApi.getById(id!),
    enabled: !!id,
    select: (res) => res.Result ?? null,
  });
}

export function useNhiemVuNgayDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["nhiemvungay", id],
    queryFn: () => reportApi.getNhiemVuByDonBaoCao(id!),
    enabled: !!id,
    staleTime: 60_000,
    select: (res) => res.Result ?? null,
  });
}

export function useSubmitReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useRecallReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportApi.recall(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useApproveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useRefuseReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; ghiChu: string }) =>
      reportApi.refuse(v.id, { ghiChu: v.ghiChu }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useOwnReport(
  maDonVi: string | undefined,
  ngay: string,
  isAggregating: boolean,
) {
  const loai: LoaiDonBaoCao = isAggregating ? "TONG_HOP" : "DON_VI";
  return useQuery({
    queryKey: [...reportsKey(maDonVi ?? "", ngay), "OWN", loai],
    queryFn: () => reportApi.searchByUnitAndDate(maDonVi!, ngay, loai),
    enabled: !!maDonVi && !!ngay,
    select: (res) => res.Result ?? null,
  });
}