import { useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { politicalWorkApi } from "./api";
import { normalizeStatus } from "@/shared/report/status";
import { isBctUnit } from "./politicalUnits";
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

  const isSuDoanView = (capByUnit[maDonVi ?? ""] ?? "") === "SU_DOAN";
  const trungDoanChildren = useMemo(
    () =>
      isSuDoanView && maDonVi
        ? units.filter(
            (u) =>
              u.maDonVi.startsWith(maDonVi + ".") &&
              !u.maDonVi.slice(maDonVi.length + 1).includes(".") &&
              u.capDonVi === "TRUNG_DOAN",
          )
        : [],
    [isSuDoanView, maDonVi, units],
  );

  const bctQueries = useQueries({
    queries: trungDoanChildren.map((td) => ({
      queryKey: [...politicalKey(td.maDonVi, ngay), "TD_BCT_CONS"],
      queryFn: () =>
        politicalWorkApi.getByDonViChildren(td.maDonVi, ngay, "TONG_HOP"),
      enabled: baseEnabled && hasChildren,
      select: (res: { Result?: PoliticalWorkItem[] }) => res.Result ?? [],
    })),
  });

  const bctSignal = bctQueries.map((q) => q.dataUpdatedAt).join(",");

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
      if (isAggregating || isSelf) {
        map.set(ma, item);
      }
    }

    trungDoanChildren.forEach((td, i) => {
      const list = bctQueries[i]?.data ?? [];
      const bctItem = list.find((it) => isBctUnit(it.donVi));
      if (bctItem && normalizeStatus(bctItem.status) === "Đã_Duyệt") {
        map.set(td.maDonVi, {
          ...bctItem,
          donVi: {
            ...bctItem.donVi,
            maDonVi: td.maDonVi,
            tenDonvi: td.tenDonvi ?? bctItem.donVi.tenDonvi,
            kyhieuDonvi: td.kyhieuDonvi ?? bctItem.donVi.kyhieuDonvi,
            capDonVi: td.capDonVi ?? bctItem.donVi.capDonVi,
          },
        });
      }
    });

    return Array.from(map.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasChildren,
    maDonVi,
    selfQuery.data,
    donViQuery.data,
    tongHopQuery.data,
    capByUnit,
    trungDoanChildren,
    bctSignal,
  ]);

  return {
    data,
    isLoading: hasChildren
      ? donViQuery.isLoading || tongHopQuery.isLoading
      : selfQuery.isLoading,
  };
}

export function useConsolidatedForUnit(
  viewMaDonVi: string | undefined,
  sourceMaDonVi: string | undefined,
  ngay: string,
  opts?: {
    enabled?: boolean;
    approvedOnly?: boolean;
    viewTenDonvi?: string;
    viewKyhieuDonvi?: string;
  },
) {
  const enabled =
    (opts?.enabled ?? true) && !!viewMaDonVi && !!sourceMaDonVi && !!ngay;
  const approvedOnly = opts?.approvedOnly ?? false;
  const viewTenDonvi = opts?.viewTenDonvi;
  const viewKyhieuDonvi = opts?.viewKyhieuDonvi;

  const query = useQuery({
    queryKey: [
      ...politicalKey(sourceMaDonVi ?? "", ngay),
      "CONS_FOR",
      viewMaDonVi ?? "",
    ],
    queryFn: () =>
      politicalWorkApi.getByDonVi(sourceMaDonVi!, ngay, "TONG_HOP"),
    enabled,
    select: (res) => res.Result ?? null,
  });

  const data = useMemo(() => {
    const item = query.data;
    if (!item) return [];
    if (approvedOnly && normalizeStatus(item.status) !== "Đã_Duyệt") return [];
    return [
      {
        ...item,
        donVi: {
          ...item.donVi,
          maDonVi: viewMaDonVi!,
          tenDonvi: viewTenDonvi ?? item.donVi.tenDonvi,
          kyhieuDonvi: viewKyhieuDonvi ?? item.donVi.kyhieuDonvi,
        },
      },
    ];
  }, [query.data, approvedOnly, viewMaDonVi, viewTenDonvi, viewKyhieuDonvi]);

  return { data, isLoading: query.isLoading };
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

export function useOwnPoliticalReport(
  maDonVi: string | undefined,
  ngay: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...politicalKey(maDonVi ?? "", ngay), "OWN_DON_VI"],
    queryFn: () => politicalWorkApi.getByDonVi(maDonVi!, ngay, "DON_VI"),
    enabled: enabled && !!maDonVi && !!ngay,
    select: (res) => res.Result ?? null,
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
