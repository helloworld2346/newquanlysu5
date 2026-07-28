import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dutyApi } from "./api";
import type { TrucNguoiPayload } from "@/types/duty";

const chiHuyKey = ["truc-chi-huy"] as const;
const tacChienKey = ["truc-ban-tac-chien"] as const;

export function useTrucChiHuy() {
  return useQuery({ queryKey: chiHuyKey, queryFn: dutyApi.getAllTrucChiHuy });
}

export function useTrucBanTacChien() {
  return useQuery({
    queryKey: tacChienKey,
    queryFn: dutyApi.getAllTrucBanTacChien,
  });
}

export function useCreateNguoiTruc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { type: "chiHuy" | "tacChien"; body: TrucNguoiPayload }) =>
      v.type === "chiHuy"
        ? dutyApi.createTrucChiHuy(v.body)
        : dutyApi.createTrucBanTacChien(v.body),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: v.type === "chiHuy" ? chiHuyKey : tacChienKey,
      }),
  });
}

export function useUpdateNguoiTruc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      type: "chiHuy" | "tacChien";
      id: string;
      body: TrucNguoiPayload;
    }) =>
      v.type === "chiHuy"
        ? dutyApi.updateTrucChiHuy(v.id, v.body)
        : dutyApi.updateTrucBanTacChien(v.id, v.body),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: v.type === "chiHuy" ? chiHuyKey : tacChienKey,
      }),
  });
}

export function useDeleteNguoiTruc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { type: "chiHuy" | "tacChien"; id: string }) =>
      v.type === "chiHuy"
        ? dutyApi.deleteTrucChiHuy(v.id)
        : dutyApi.deleteTrucBanTacChien(v.id),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: v.type === "chiHuy" ? chiHuyKey : tacChienKey,
      }),
  });
}
