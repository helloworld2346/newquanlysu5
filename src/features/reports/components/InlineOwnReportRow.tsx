import { useState } from "react";
import { toast } from "sonner";
import { Save, Pencil, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateReport, useSubmitReport } from "../queries";
import { EMPTY_VANG, VANG_KEYS, formatNum } from "../utils";
import { getErrorMessage } from "@/lib/errorHandler";
import type {
  CreateReportRequest,
  ReportRow,
  VangChiTiet,
} from "@/types/dailyReport";

const td = "border text-center tabular-nums break-words px-1";

const EMPTY_TRUC = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

export default function InlineOwnReportRow({
  maDonVi,
  label,
  ngay,
  existing,
}: {
  maDonVi: string;
  label: string;
  ngay: string;
  existing: ReportRow | null;
}) {
  const createReport = useCreateReport();
  const submitReport = useSubmitReport();

  const [editing, setEditing] = useState(false);
  const [quanSoTong, setQuanSoTong] = useState(0);
  const [vang, setVang] = useState<VangChiTiet>({ ...EMPTY_VANG });

  const saving = createReport.isPending || submitReport.isPending;
  const quanSoVang = VANG_KEYS.reduce((s, k) => s + (vang[k] || 0), 0);
  const quanSoHienDien = Math.max(quanSoTong - quanSoVang, 0);

  const startEdit = () => {
    setQuanSoTong(existing?.quanSoTong ?? 0);
    setVang(existing ? { ...EMPTY_VANG, ...existing.vang } : { ...EMPTY_VANG });
    setEditing(true);
  };

  const setVangKey = (k: keyof VangChiTiet, val: string) =>
    setVang((v) => ({ ...v, [k]: Number(val) || 0 }));

  const handleSave = async () => {
    if (quanSoTong <= 0) return toast.error("Nhập tổng quân số.");
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
      toast.success("Đã lưu và trình báo cáo CH/e.");
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Đã có báo cáo, không đang sửa -> readonly
  if (existing && !existing.notSubmitted && !editing) {
    const v = existing.vang;
    return (
      <TableRow className="bg-primary/5">
        <TableCell className={`${td} font-medium`}>{label}</TableCell>
        <TableCell className={td}>{formatNum(existing.quanSoTong)}</TableCell>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={startEdit}
            aria-label="Sửa"
          >
            <Pencil className="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  // Chưa nhập -> dòng rỗng, bấm để nhập
  if (!editing) {
    return (
      <TableRow
        className="cursor-pointer bg-primary/5 hover:bg-primary/10"
        onClick={startEdit}
      >
        <TableCell className={`${td} font-medium`}>{label}</TableCell>
        <TableCell
          colSpan={20}
          className={`${td} text-left text-muted-foreground`}
        >
          Bấm để nhập số liệu báo cáo CH/e...
        </TableCell>
        <TableCell className={td}>
          <Button variant="ghost" size="icon" aria-label="Nhập">
            <Pencil className="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  // Đang nhập
  return (
    <TableRow className="bg-primary/5">
      <TableCell className={`${td} font-medium`}>{label}</TableCell>
      <TableCell className={td}>
        <Input
          type="number"
          min={0}
          value={quanSoTong || ""}
          onChange={(e) => setQuanSoTong(Number(e.target.value) || 0)}
          className="h-8 px-1 text-center"
        />
      </TableCell>
      <TableCell className={td}>{formatNum(quanSoHienDien)}</TableCell>
      <TableCell className={td}>{formatNum(quanSoVang)}</TableCell>
      {VANG_KEYS.map((k) => (
        <TableCell key={k} className={td}>
          <Input
            type="number"
            min={0}
            value={vang[k] || ""}
            onChange={(e) => setVangKey(k, e.target.value)}
            className="h-8 px-1 text-center"
          />
        </TableCell>
      ))}
      <TableCell className={td}>
        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          Nháp
        </span>
      </TableCell>
      <TableCell className={td}>—</TableCell>
      <TableCell className={`${td} text-left`}>—</TableCell>
      <TableCell className={td}>
        <div className="flex items-center justify-center">
          <Button size="icon" onClick={handleSave} disabled={saving}>
            <Save className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-1"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            <X className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
