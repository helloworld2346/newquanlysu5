import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { politicalWorkApi } from "./api";
import type {
  PoliticalWorkItem,
  PoliticalWorkRequest,
  PoliticalWorkForm,
} from "@/types/politicalWork";

export const politicalKey = (maDonVi: string, ngay: string) =>
  ["political-work", maDonVi, ngay] as const;

export const TONG_HOP_CAPS = ["SU_DOAN", "TRUNG_DOAN", "TIEU_DOAN"];

export function usePoliticalMerged(
  maDonVi: string | undefined,
  ngay: string,
  capByUnit: Record<string, string | null | undefined>,
  hasChildren = true,
  ready = true,
) {
  const baseEnabled = !!maDonVi && !!ngay && ready;

  const selfQuery = useQuery({
    queryKey: [...politicalKey(maDonVi ?? "", ngay), "SELF"],
    queryFn: () => politicalWorkApi.getByDonVi(maDonVi!, ngay, "DON_VI"),
    enabled: baseEnabled && !hasChildren,
    select: (res) => (res.Result ? [res.Result] : []),
  });

  const donViQuery = useQuery({
    queryKey: [...politicalKey(maDonVi ?? "", ngay), "DON_VI"],
    queryFn: () =>
      politicalWorkApi.getByDonViChildren(maDonVi!, ngay, "DON_VI"),
    enabled: baseEnabled && hasChildren,
    select: (res) => res.Result ?? [],
  });

  const tongHopQuery = useQuery({
    queryKey: [...politicalKey(maDonVi ?? "", ngay), "TONG_HOP"],
    queryFn: () =>
      politicalWorkApi.getByDonViChildren(maDonVi!, ngay, "TONG_HOP"),
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

    const map = new Map<string, PoliticalWorkItem>();

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

export function usePoliticalDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["political-detail", id],
    queryFn: () => politicalWorkApi.getById(id!),
    enabled: !!id,
    select: (res) => res.Result ?? null,
  });
}

export function useCreatePolitical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PoliticalWorkRequest) => politicalWorkApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["political-work"] }),
  });
}

export function useUpdatePolitical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PoliticalWorkForm }) =>
      politicalWorkApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["political-work"] }),
  });
}

export function useSubmitPolitical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => politicalWorkApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["political-work"] }),
  });
}

export function useRecallPolitical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => politicalWorkApi.recall(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["political-work"] }),
  });
}

export function useApprovePolitical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => politicalWorkApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["political-work"] }),
  });
}

export function useRefusePolitical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; ghiChu: string }) =>
      politicalWorkApi.refuse(v.id, { ghiChu: v.ghiChu }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["political-work"] }),
  });
}
