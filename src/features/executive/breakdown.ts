import { useMemo } from "react";
import { useAuthInfo } from "@/features/auth/queries";
import { useUnits, useQuanSoBienChe } from "@/features/units/queries";
import { useChildrenReportsMerged } from "@/features/reports/queries";
import {
  mapItemToRow,
  buildDisplayTotals,
  EMPTY_VANG,
  VANG_KEYS,
} from "@/features/reports/utils";
import type { VangChiTiet } from "@/types/dailyReport";
import type { CoCauQuanSo } from "./api";

export function useThongKeBreakdown(ngay: string) {
  const { account } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;
  const { data: units = [] } = useUnits();

  const { data: qsbc } = useQuanSoBienChe(maDonVi);

  const capByUnit = useMemo(
    () =>
      Object.fromEntries(units.map((u) => [u.maDonVi, u.capDonVi])) as Record<
        string,
        string | null | undefined
      >,
    [units],
  );

  const hasChildren = useMemo(
    () =>
      maDonVi ? units.some((u) => u.maDonVi.startsWith(maDonVi + ".")) : false,
    [units, maDonVi],
  );

  const unitsReady = units.length > 0;

  const { data: items = [] } = useChildrenReportsMerged(
    maDonVi,
    ngay,
    capByUnit,
    hasChildren,
    unitsReady,
  );

  const rows = useMemo(() => items.map(mapItemToRow), [items]);
  const totals = useMemo(() => buildDisplayTotals(rows), [rows]);

  const bienChe = useMemo(
    () => ({
      siQuan: qsbc?.quanSoSiQuan ?? 0,
      qncn: qsbc?.quanSoQncn ?? 0,
      hsqBs: qsbc?.quanSoHsqBs ?? 0,
    }),
    [qsbc],
  );

  const tongHopVang: VangChiTiet = useMemo(() => {
    const v: VangChiTiet = { ...EMPTY_VANG };
    VANG_KEYS.forEach((k) => (v[k] = totals[k]));
    return v;
  }, [totals]);

  const coCauQuanSo: CoCauQuanSo = useMemo(
    () => ({
      siQuan: {
        bienChe: bienChe.siQuan,
        vang: totals.vangSQ,
        hienDien: Math.max(0, bienChe.siQuan - totals.vangSQ),
      },
      qncn: {
        bienChe: bienChe.qncn,
        vang: totals.vangQNCN,
        hienDien: Math.max(0, bienChe.qncn - totals.vangQNCN),
      },
      hsqBs: {
        bienChe: bienChe.hsqBs,
        vang: totals.vangHSQBS,
        hienDien: Math.max(0, bienChe.hsqBs - totals.vangHSQBS),
      },
    }),
    [bienChe, totals],
  );

  const hasData = rows.some((r) => !r.notSubmitted);

  return { tongHopVang, coCauQuanSo, hasData };
}
