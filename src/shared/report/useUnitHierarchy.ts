import { useMemo } from "react";
import { useUnits } from "@/features/units/queries";
import { computeHideDraftForCommander } from "./visibility";

export function useUnitHierarchy(args: {
  maDonVi?: string;
  isChiHuy: boolean;
  accountDonVi?: {
    tenDonvi?: string;
    kyhieuDonvi?: string;
    capDonVi?: string | null;
  };
}) {
  const { maDonVi, isChiHuy, accountDonVi } = args;
  const { data: units = [] } = useUnits();

  const capByUnit = useMemo(
    () =>
      Object.fromEntries(units.map((u) => [u.maDonVi, u.capDonVi])) as Record<
        string,
        string | null | undefined
      >,
    [units],
  );

  const capDonViAcc =
    accountDonVi?.capDonVi ?? capByUnit[maDonVi ?? ""] ?? null;

  const hideDraftForCommander = useMemo(
    () => computeHideDraftForCommander({ isChiHuy, capDonViAcc, accountDonVi }),
    [isChiHuy, capDonViAcc, accountDonVi],
  );

  const hasChildren = useMemo(() => {
    if (!maDonVi) return false;
    return units.some((u) => {
      if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
      const suffix = u.maDonVi.slice(maDonVi.length + 1);
      return !suffix.includes(".");
    });
  }, [units, maDonVi]);

  return { units, capByUnit, capDonViAcc, hideDraftForCommander, hasChildren };
}
