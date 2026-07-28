import { MoreVertical, Eye, Pencil } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReportRow } from "@/types/dailyReport";
import { formatNum } from "../utils";

const td = "border text-center tabular-nums break-words px-1";

const STATUS_LABEL: Record<string, string> = {
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
};

const APPROVED_STATUSES = ["Da_Duyet", "Đã_Duyệt", "Đã duyệt"];

function isApproved(status: string): boolean {
  return APPROVED_STATUSES.includes(status);
}

export default function ReportTableRow({
  row,
  canEdit,
  onViewDetail,
  onEdit,
}: {
  row: ReportRow;
  canEdit: boolean;
  onViewDetail: (r: ReportRow) => void;
  onEdit: (r: ReportRow) => void;
}) {
  const v = row.vang;
  const approved = !row.notSubmitted && isApproved(row.status);
  const num = (val: number | null | undefined) =>
    approved ? formatNum(val) : "—";
  const notSubmitted = row.notSubmitted;
  return (
    <TableRow
      className={notSubmitted ? "bg-rose-50 hover:bg-rose-100" : undefined}
    >
      <TableCell
        className={`${td} text-center font-medium ${
          notSubmitted ? "text-rose-700" : ""
        }`}
      >
        {row.kyhieuDonVi || row.tenDonVi}
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
          <span className="font-semibold text-rose-600">Chưa nộp</span>
        ) : (
          (STATUS_LABEL[row.status] ?? row.status)
        )}
      </TableCell>
      <TableCell className={td}>
        {notSubmitted ? (
          "—"
        ) : (
          <span className="text-muted-foreground">Chưa ký</span>
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
