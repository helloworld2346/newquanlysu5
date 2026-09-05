import type { ReportRow } from "@/types/dailyReport";
import type { DisplayTotals } from "@/features/reports/utils";

export function reportRowToExportCells(row: ReportRow): (string | number)[] {
  return [
    row.kyhieuDonVi || row.tenDonVi,
    row.quanSoTong,
    row.quanSoHienDien,
    row.quanSoVang,
    row.vang.hoiThaiNgoaiSuDoan,
    row.vang.hoiThaiEF,
    row.vang.xayDungNgoaiSuDoan,
    row.vang.xayDungEF,
    row.vang.choHuu,
    row.vang.nghiTranhThu,
    row.vang.phep,
    row.vang.vienNgoaiSuDoan,
    row.vang.vienEF,
    row.vang.congTacNgoaiSuDoan,
    row.vang.congTacSuDoan,
    row.vang.hocSQ,
    row.vang.hocCS,
    row.vang.lyDoVangKhac ?? 0,
  ];
}

export function totalsToExportCells(t: DisplayTotals): (string | number)[] {
  return [
    "Tổng",
    t.quanSoTong,
    t.quanSoHienDien,
    t.quanSoVang,
    t.hoiThaiNgoaiSuDoan,
    t.hoiThaiEF,
    t.xayDungNgoaiSuDoan,
    t.xayDungEF,
    t.choHuu,
    t.nghiTranhThu,
    t.phep,
    t.vienNgoaiSuDoan,
    t.vienEF,
    t.congTacNgoaiSuDoan,
    t.congTacSuDoan,
    t.hocSQ,
    t.hocCS,
    t.lyDoVangKhac,
  ];
}
