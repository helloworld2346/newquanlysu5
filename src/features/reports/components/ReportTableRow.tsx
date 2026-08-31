import { useState } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  Send,
  Undo2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import KySoModal from "./KySoModal";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReportRow, TrucNguoiInfo } from "@/types/dailyReport";
import { formatNum } from "../utils";

const td = "border text-center tabular-nums break-words px-1";

const STATUS_LABEL: Record<string, string> = {
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
  Nháp: "Nháp",
  Nhap: "Nháp",
};

const STATUS_TONE: Record<string, string> = {
  Chờ_Duyệt: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  "Chờ duyệt": "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  Đã_Duyệt: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  Da_Duyet: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  "Đã duyệt": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  Tu_Choi: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  Từ_Chối: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  "Từ chối": "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  Nháp: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  Nhap: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
};

function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function ReportTableRow({
  row,
  canEdit,
  canSubmit = false,
  canRecall = false,
  canApprove = false,
  canRefuse = false,
  onViewDetail,
  onEdit,
  onSubmit,
  onRecall,
  onApprove,
  onRefuse,
  displayKyHieu,
  noKySo = false,
}: {
  row: ReportRow;
  canEdit: boolean;
  canSubmit?: boolean;
  canRecall?: boolean;
  canApprove?: boolean;
  canRefuse?: boolean;
  onViewDetail: (r: ReportRow) => void;
  onEdit: (r: ReportRow) => void;
  onSubmit?: (r: ReportRow) => void;
  onRecall?: (r: ReportRow) => void;
  onApprove?: (r: ReportRow) => void;
  onRefuse?: (r: ReportRow) => void;
  displayKyHieu?: string;
  noKySo?: boolean;
}) {
  const [showKySo, setShowKySo] = useState(false);

  const v = row.vang;
  const showNum = !row.notSubmitted;
  const num = (val: number | null | undefined) =>
    showNum ? formatNum(val) : "—";
  const notSubmitted = row.notSubmitted;

  const signed = !!row.raw?.chuKySo && row.raw.chuKySo.trim() !== "";
  const signer = parseJson<TrucNguoiInfo | null>(row.raw?.trucBanChiHuy, null);

  return (
    <TableRow
      className={notSubmitted ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50" : undefined}
    >
      <TableCell
        className={`${td} text-center font-medium ${
          notSubmitted ? "text-rose-700 dark:text-rose-300" : ""
        }`}
      >
        {displayKyHieu ?? (row.kyhieuDonVi || row.tenDonVi)}
      </TableCell>
      <TableCell className={td}>{num(row.quanSoTong)}</TableCell>
      <TableCell className={td}>{num(row.quanSoHienDien)}</TableCell>
      <TableCell className={td}>{num(row.quanSoVang)}</TableCell>
      <TableCell className={td}>{num(v.hoiThaiNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{num(v.hoiThaiEF)}</TableCell>
      <TableCell className={td}>{num(v.xayDungNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{num(v.xayDungEF)}</TableCell>
      <TableCell className={td}>{num(v.choHuu)}</TableCell>
      <TableCell className={td}>{num(v.nghiTranhThu)}</TableCell>
      <TableCell className={td}>{num(v.phep)}</TableCell>
      <TableCell className={td}>{num(v.vienNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{num(v.vienEF)}</TableCell>
      <TableCell className={td}>{num(v.congTacNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{num(v.congTacSuDoan)}</TableCell>
      <TableCell className={td}>{num(v.hocSQ)}</TableCell>
      <TableCell className={td}>{num(v.hocCS)}</TableCell>
      <TableCell className={td}>{num(v.lyDoVangKhac)}</TableCell>
      <TableCell className={td}>
        {notSubmitted ? (
          <span className="inline-block rounded-full bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300">
            Chưa nộp
          </span>
        ) : (
          <StatusBadge status={row.status} />
        )}
      </TableCell>
      <TableCell className={td}>
        {notSubmitted ? (
          "—"
        ) : signed ? (
          <button
            type="button"
            onClick={() => setShowKySo(true)}
            className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
          >
            Đã ký
          </button>
        ) : noKySo ? (
          "—"
        ) : (
          <span className="inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Chưa ký
          </span>
        )}
      </TableCell>
      <TableCell className={`${td} text-left`}>{row.ghiChu}</TableCell>
      <TableCell className={td}>
        {notSubmitted ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Thao tác">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetail(row)}>
                <Eye className="mr-2 size-4" /> Xem chi tiết
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(row)}>
                  <Pencil className="mr-2 size-4" /> Chỉnh sửa
                </DropdownMenuItem>
              )}

              {(canSubmit || canRecall) && <DropdownMenuSeparator />}
              {canSubmit && (
                <DropdownMenuItem onClick={() => onSubmit?.(row)}>
                  <Send className="mr-2 size-4" /> Trình phê duyệt
                </DropdownMenuItem>
              )}
              {canRecall && (
                <DropdownMenuItem onClick={() => onRecall?.(row)}>
                  <Undo2 className="mr-2 size-4" /> Thu hồi
                </DropdownMenuItem>
              )}

              {(canApprove || canRefuse) && <DropdownMenuSeparator />}
              {canApprove && (
                <DropdownMenuItem onClick={() => onApprove?.(row)}>
                  <CheckCircle2 className="mr-2 size-4 text-emerald-600 dark:text-emerald-400" /> Phê
                  duyệt
                </DropdownMenuItem>
              )}
              {canRefuse && (
                <DropdownMenuItem
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
                  onClick={() => onRefuse?.(row)}
                >
                  <XCircle className="mr-2 size-4" /> Từ chối
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>

      {signed && (
        <KySoModal
          open={showKySo}
          onOpenChange={setShowKySo}
          chuKySo={row.raw?.chuKySo ?? ""}
          hoTen={signer?.tenNguoitruc}
          capBac={signer?.capbacNguoitruc}
          chucVu={signer?.chucvuNguoitruc || "Người báo cáo"}
          donViLabel={row.kyhieuDonVi || row.tenDonVi}
          thoiGian={row.raw?.thoiGianBaoCao}
        />
      )}
    </TableRow>
  );
}
