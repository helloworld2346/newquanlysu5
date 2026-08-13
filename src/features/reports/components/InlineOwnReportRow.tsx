// src/features/reports/components/InlineOwnReportRow.tsx
import { useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Pencil,
  X,
  MousePointerClick,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateReport, useSubmitReport } from "../queries";
import { EMPTY_VANG, VANG_KEYS, formatNum } from "../utils";
import { getErrorMessage } from "@/lib/errorHandler";
import type {
  CreateReportRequest,
  ReportRow,
  VangChiTiet,
} from "@/types/dailyReport";

const rowBase = "border-l-4 border-l-primary bg-primary/5 transition-colors";
const td = "border text-center tabular-nums break-words px-1";

const cellInput =
  "h-8 w-full min-w-0 rounded-md border border-input bg-background px-1 text-center text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring " +
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const EMPTY_TRUC = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

function UnitBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      {label}
    </span>
  );
}

export default function InlineOwnReportRow({
  maDonVi,
  label,
  ngay,
  existing,
  bienCheTong = 0,
}: {
  maDonVi: string;
  label: string;
  ngay: string;
  existing: ReportRow | null;
  bienCheTong?: number;
}) {
  const createReport = useCreateReport();
  const submitReport = useSubmitReport();

  const [editing, setEditing] = useState(false);
  const [quanSoTong, setQuanSoTong] = useState(bienCheTong);
  const [vang, setVang] = useState<VangChiTiet>({ ...EMPTY_VANG });

  const saving = createReport.isPending || submitReport.isPending;
  const quanSoVang = VANG_KEYS.reduce((s, k) => s + (vang[k] || 0), 0);
  const quanSoHienDien = Math.max(quanSoTong - quanSoVang, 0);

  const startEdit = () => {
    setQuanSoTong(bienCheTong || existing?.quanSoTong || 0);
    setVang(existing ? { ...EMPTY_VANG, ...existing.vang } : { ...EMPTY_VANG });
    setEditing(true);
  };

  const setVangKey = (k: keyof VangChiTiet, val: string) =>
    setVang((v) => ({ ...v, [k]: Number(val) || 0 }));

  const handleSave = async () => {
    if (quanSoTong <= 0)
      return toast.error(
        "Chưa có quân số biên chế. Vui lòng nhập trong Cài đặt.",
      );
    if (quanSoVang > quanSoTong)
      return toast.error("Tổng vắng không được lớn hơn tổng quân số.");
    try {
      const payload: CreateReportRequest = {
        quanSoTong,
        quanSoHienDien,
        quanSoVang,
        thoiGianBaoCao: new Date(`${ngay}T12:00:00.000Z`).toISOString(),
        chiTietVang: JSON.stringify([]),
        thongTinVang: JSON.stringify(vang),
        donVi: maDonVi,
        trucBanChiHuy: JSON.stringify(EMPTY_TRUC),
        trucBanTacChien: JSON.stringify(EMPTY_TRUC),
        tinhHinhHoatDong: "",
        loaiDonBaoCao: "DON_VI",
      };
      const res = await createReport.mutateAsync(payload);
      const id = res.Result?.idDonBaoCao;
      if (!id) throw new Error(res.message || "Không tạo được báo cáo");
      await submitReport.mutateAsync(id);
      toast.success(`Đã lưu và trình báo cáo ${label}.`);
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (existing && !existing.notSubmitted && !editing) {
    const v = existing.vang;
    return (
      <TableRow className={rowBase}>
        <TableCell className={`${td} font-medium`}>
          <UnitBadge label={label} />
        </TableCell>
        <TableCell className={`${td} font-semibold`}>
          {formatNum(existing.quanSoTong)}
        </TableCell>
        <TableCell className={td}>
          {formatNum(existing.quanSoHienDien)}
        </TableCell>
        <TableCell className={td}>{formatNum(existing.quanSoVang)}</TableCell>
        {VANG_KEYS.map((k) => (
          <TableCell key={k} className={td}>
            {formatNum(v[k])}
          </TableCell>
        ))}
        <TableCell className={td}>
          <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Đã nộp
          </span>
        </TableCell>
        <TableCell className={td}>—</TableCell>
        <TableCell className={`${td} text-left`}>{existing.ghiChu}</TableCell>
        <TableCell className={td}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Thao tác">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={startEdit}>
                <Pencil className="mr-2 size-4" /> Chỉnh sửa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  if (!editing) {
    return (
      <TableRow
        className={`cursor-pointer hover:bg-primary/10 ${rowBase}`}
        onClick={startEdit}
      >
        <TableCell className={`${td} font-medium`}>
          <UnitBadge label={label} />
        </TableCell>
        <TableCell
          colSpan={20}
          className={`${td} text-left text-muted-foreground`}
        >
          <span className="inline-flex items-center gap-1.5">
            <MousePointerClick className="size-4 text-primary/70" />
            Bấm để nhập số liệu báo cáo {label}...
          </span>
        </TableCell>
        <TableCell className={td}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Thao tác"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={startEdit}>
                <Pencil className="mr-2 size-4" /> Nhập số liệu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className={rowBase}>
      <TableCell className={`${td} font-medium`}>
        <UnitBadge label={label} />
      </TableCell>
      <TableCell
        className={`${td} font-semibold`}
        title="Lấy từ quân số biên chế (Cài đặt)"
      >
        {formatNum(quanSoTong)}
      </TableCell>
      <TableCell className={`${td} font-medium text-emerald-700`}>
        {formatNum(quanSoHienDien)}
      </TableCell>
      <TableCell className={`${td} font-medium text-rose-600`}>
        {formatNum(quanSoVang)}
      </TableCell>
      {VANG_KEYS.map((k) => (
        <TableCell key={k} className={td}>
          <input
            type="number"
            min={0}
            value={vang[k] || ""}
            onChange={(e) => setVangKey(k, e.target.value)}
            className={cellInput}
          />
        </TableCell>
      ))}
      <TableCell className={td}>
        <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Nháp
        </span>
      </TableCell>
      <TableCell className={td}>—</TableCell>
      <TableCell className={`${td} text-left`}>—</TableCell>
      <TableCell className={td}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Thao tác"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MoreVertical className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleSave();
              }}
              disabled={saving}
            >
              <Save className="mr-2 size-4 text-emerald-600" /> Lưu và trình
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-600"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <X className="mr-2 size-4" /> Hủy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
