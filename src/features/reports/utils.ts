import type {
  VangChiTiet,
  AbsentRow,
  ReportRow,
  ReportItemDTO,
} from "@/types/dailyReport";

export const EMPTY_VANG: VangChiTiet = {
  hoiThaiNgoaiSuDoan: 0,
  hoiThaiEF: 0,
  xayDungNgoaiSuDoan: 0,
  xayDungEF: 0,
  choHuu: 0,
  nghiTranhThu: 0,
  phep: 0,
  vienNgoaiSuDoan: 0,
  vienEF: 0,
  congTacNgoaiSuDoan: 0,
  congTacSuDoan: 0,
  hocSQ: 0,
  hocCS: 0,
  lyDoVangKhac: 0,
};

export const VANG_KEYS = Object.keys(EMPTY_VANG) as (keyof VangChiTiet)[];

export const LY_DO_OPTIONS: { value: keyof VangChiTiet; label: string }[] = [
  { value: "hoiThaiNgoaiSuDoan", label: "Hội thao - Ngoài Sư đoàn" },
  { value: "hoiThaiEF", label: "Hội thao - e, f" },
  { value: "xayDungNgoaiSuDoan", label: "Xây dựng - Ngoài Sư đoàn" },
  { value: "xayDungEF", label: "Xây dựng - e, f" },
  { value: "vienNgoaiSuDoan", label: "Viện - Ngoài Sư đoàn" },
  { value: "vienEF", label: "Viện - e, f" },
  { value: "congTacNgoaiSuDoan", label: "Công tác - Ngoài Sư đoàn" },
  { value: "congTacSuDoan", label: "Công tác - Sư đoàn" },
  { value: "hocSQ", label: "Học - Sĩ quan" },
  { value: "hocCS", label: "Học - Chiến sĩ" },
  { value: "choHuu", label: "Chờ hưu" },
  { value: "nghiTranhThu", label: "Nghỉ tranh thủ" },
  { value: "phep", label: "Phép" },
  { value: "lyDoVangKhac", label: "Lý do khác" },
];

export const CAP_BAC_OPTIONS = [
  "Binh nhất",
  "Binh nhì",
  "Hạ sĩ",
  "Trung sĩ",
  "Thượng sĩ",
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
  "Đại tá",
  "Thiếu úy QNCN",
  "Trung úy QNCN",
  "Thượng úy QNCN",
  "Đại úy QNCN",
  "Thiếu tá QNCN",
  "Trung tá QNCN",
  "Thượng tá QNCN",
];

export type QuanSoLoai = "siQuan" | "qncn" | "hsqBs";

export function classifyCapBac(capBac: string): QuanSoLoai {
  const c = capBac.toLowerCase();
  if (c.includes("qncn")) return "qncn";
  if (c.includes("úy") || c.includes("tá") || c.includes("tướng"))
    return "siQuan";
  return "hsqBs";
}

export function todayIso(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatNum(v: number | null | undefined): string {
  return (v ?? 0).toLocaleString("vi-VN");
}

export function absentRowsToVang(rows: AbsentRow[]): VangChiTiet {
  const acc: VangChiTiet = { ...EMPTY_VANG };
  rows.forEach((r) => {
    if (r.lyDoVang && r.lyDoVang in acc) acc[r.lyDoVang as keyof VangChiTiet]++;
  });
  return acc;
}

export function mapItemToRow(item: ReportItemDTO): ReportRow {
  let vang: VangChiTiet = { ...EMPTY_VANG };
  try {
    vang = { ...EMPTY_VANG, ...(JSON.parse(item.thongTinVang) as VangChiTiet) };
  } catch {
    /* ignore */
  }
  return {
    idDonBaoCao: item.idDonBaoCao,
    donVi: item.donVi.maDonVi,
    tenDonVi: item.donVi.tenDonvi,
    kyhieuDonVi: item.donVi.kyhieuDonvi,
    quanSoTong: item.quanSoTong,
    quanSoHienDien: item.quanSoHienDien,
    quanSoVang: item.quanSoVang,
    vang,
    status: item.status,
    ghiChu: item.ghiChu ?? "",
    raw: item,
  };
}

export type DisplayTotals = VangChiTiet & {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
};

export function buildDisplayTotals(rows: ReportRow[]): DisplayTotals {
  const base: DisplayTotals = {
    ...EMPTY_VANG,
    quanSoTong: 0,
    quanSoHienDien: 0,
    quanSoVang: 0,
  };
  return rows.reduce((acc, r) => {
    acc.quanSoTong += r.quanSoTong;
    acc.quanSoHienDien += r.quanSoHienDien;
    acc.quanSoVang += r.quanSoVang;
    VANG_KEYS.forEach((k) => (acc[k] += r.vang[k] ?? 0));
    return acc;
  }, base);
}
