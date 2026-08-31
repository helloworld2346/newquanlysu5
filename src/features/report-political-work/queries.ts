import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { politicalWorkApi } from "./api";
import { stripMarks } from "@/shared/report/visibility";
import { normalizeStatus } from "@/shared/report/status";
import type {
  PoliticalWorkItem,
  PoliticalWorkRequest,
  PoliticalWorkForm,
} from "@/types/politicalWork";

export const politicalKey = (maDonVi: string, ngay: string) =>
  ["political-work", maDonVi, ngay] as const;

export const TONG_HOP_CAPS = ["SU_DOAN", "TRUNG_DOAN", "TIEU_DOAN"];

type UnitLite = {
  maDonVi: string;
  tenDonvi?: string;
  kyhieuDonvi?: string;
  capDonVi?: string | null;
};

export function isBctUnit(u?: {
  kyhieuDonvi?: string;
  tenDonvi?: string;
}): boolean {
  if (!u) return false;
  const sym = stripMarks(u.kyhieuDonvi ?? "");
  const name = stripMarks(u.tenDonvi ?? "");
  return sym.includes("bct") || name.includes("ban chinh tri");
}

export function isPctUnit(u?: {
  kyhieuDonvi?: string;
  tenDonvi?: string;
}): boolean {
  if (!u) return false;
  const sym = stripMarks(u.kyhieuDonvi ?? "");
  const name = stripMarks(u.tenDonvi ?? "");
  return sym.includes("pct") || name.includes("chinh tri");
}

const isApproved = (status: string) => normalizeStatus(status) === "Đã_Duyệt";

export function usePoliticalMerged(
  maDonVi: string | undefined,
  ngay: string,
  capByUnit: Record<string, string | null | undefined>,
  hasChildren = true,
  ready = true,
  units: UnitLite[] = [],
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

  const directChildren = useMemo(() => {
    if (!maDonVi) return [] as UnitLite[];
    return units.filter((u) => {
      if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
      const suffix = u.maDonVi.slice(maDonVi.length + 1);
      return !suffix.includes(".");
    });
  }, [units, maDonVi]);

  const isSuDoanView = (capByUnit[maDonVi ?? ""] ?? "") === "SU_DOAN";

  const trungDoanChildren = useMemo(
    () => directChildren.filter((u) => u.capDonVi === "TRUNG_DOAN"),
    [directChildren],
  );

  const bct = useQueries({
    queries: (isSuDoanView ? trungDoanChildren : []).map((td) => ({
      queryKey: [...politicalKey(maDonVi ?? "", ngay), "BCT_OF", td.maDonVi],
      queryFn: () =>
        politicalWorkApi.getByDonViChildren(td.maDonVi, ngay, "TONG_HOP"),
      enabled: baseEnabled && hasChildren && isSuDoanView,
      select: (res: { Result?: PoliticalWorkItem[] }) => res.Result ?? [],
    })),
    combine: (results) => ({
      data: results.map((r) => (r.data as PoliticalWorkItem[]) ?? []),
      isLoading: results.some((r) => r.isLoading),
    }),
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

    bct.data.forEach((items, idx) => {
      const td = trungDoanChildren[idx];
      if (!td) return;
      const bctItem = items.find((it) => isBctUnit(it.donVi));
      if (bctItem && isApproved(bctItem.status)) {
        map.set(td.maDonVi, {
          ...bctItem,
          donVi: {
            maDonVi: td.maDonVi,
            tenDonvi: td.tenDonvi ?? bctItem.donVi.tenDonvi,
            kyhieuDonvi: td.kyhieuDonvi ?? bctItem.donVi.kyhieuDonvi,
            capDonVi: td.capDonVi ?? bctItem.donVi.capDonVi,
          },
        });
      }
    });

    return Array.from(map.values());
  }, [
    hasChildren,
    maDonVi,
    selfQuery.data,
    donViQuery.data,
    tongHopQuery.data,
    capByUnit,
    bct.data,
    trungDoanChildren,
  ]);

  return {
    data,
    isLoading: hasChildren
      ? donViQuery.isLoading || tongHopQuery.isLoading || bct.isLoading
      : selfQuery.isLoading,
  };
}

export function useTongHopPolitical(
  maDonVi: string | undefined,
  ngay: string,
  hasChildren = true,
) {
  return useQuery({
    queryKey: [...politicalKey(maDonVi ?? "", ngay), "TONG_HOP_TAB"],
    queryFn: () => politicalWorkApi.getByDonVi(maDonVi!, ngay, "TONG_HOP"),
    enabled: !!maDonVi && !!ngay && hasChildren,
    select: (res) => (res.Result ? [res.Result] : []),
  });
}

export function useConsolidatedForUnit(
  parentMaDonVi: string | undefined,
  consolidatedMaDonVi: string | undefined,
  ngay: string,
  opts: { enabled?: boolean; approvedOnly?: boolean } = {},
) {
  const { enabled = true, approvedOnly = false } = opts;
  return useQuery({
    queryKey: [
      ...politicalKey(consolidatedMaDonVi ?? "", ngay),
      "CONS_FOR",
      parentMaDonVi ?? "",
    ],
    queryFn: () =>
      politicalWorkApi.getByDonVi(consolidatedMaDonVi!, ngay, "TONG_HOP"),
    enabled: !!parentMaDonVi && !!consolidatedMaDonVi && !!ngay && enabled,
    select: (res) => {
      const item = res.Result;
      if (!item) return [] as PoliticalWorkItem[];
      if (approvedOnly && !isApproved(item.status)) return [];
      const remapped: PoliticalWorkItem = {
        ...item,
        donVi: { ...item.donVi, maDonVi: parentMaDonVi! },
      };
      return [remapped];
    },
  });
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
