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

const td = "border text-center tabular-nums whitespace-nowrap px-2";

const STATUS_LABEL: Record<string, string> = {
  Nháp: "Nháp",
  Da_Nop: "Đã nộp",
  "Đã nộp": "Đã nộp",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
};

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
  return (
    <TableRow>
      <TableCell className={`${td} text-center font-medium`}>
        {row.kyhieuDonVi || row.tenDonVi}
      </TableCell>
      <TableCell className={td}>{formatNum(row.quanSoTong)}</TableCell>
      <TableCell className={td}>{formatNum(row.quanSoHienDien)}</TableCell>
      <TableCell className={td}>{formatNum(row.quanSoVang)}</TableCell>
      <TableCell className={td}>{formatNum(v.hoiThaiNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(v.hoiThaiEF)}</TableCell>
      <TableCell className={td}>{formatNum(v.xayDungNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(v.xayDungEF)}</TableCell>
      <TableCell className={td}>{formatNum(v.choHuu)}</TableCell>
      <TableCell className={td}>{formatNum(v.nghiTranhThu)}</TableCell>
      <TableCell className={td}>{formatNum(v.phep)}</TableCell>
      <TableCell className={td}>{formatNum(v.vienNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(v.vienEF)}</TableCell>
      <TableCell className={td}>{formatNum(v.congTacNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(v.congTacSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(v.hocSQ)}</TableCell>
      <TableCell className={td}>{formatNum(v.hocCS)}</TableCell>
      <TableCell className={td}>{formatNum(v.lyDoVangKhac)}</TableCell>
      <TableCell className={td}>
        {STATUS_LABEL[row.status] ?? row.status}
      </TableCell>
      <TableCell className={`${td} text-left`}>{row.ghiChu}</TableCell>
      <TableCell className={td}>
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
      </TableCell>
    </TableRow>
  );
}
