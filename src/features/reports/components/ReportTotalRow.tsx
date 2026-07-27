import { TableCell, TableRow } from "@/components/ui/table";
import type { DisplayTotals } from "../utils";
import { formatNum } from "../utils";

const td = "border text-center font-bold tabular-nums break-words px-1";

export default function ReportTotalRow({ t }: { t: DisplayTotals }) {
  return (
    <TableRow className="bg-muted/60">
      <TableCell className={`${td} text-center`}>Tổng</TableCell>
      <TableCell className={td}>{formatNum(t.quanSoTong)}</TableCell>
      <TableCell className={td}>{formatNum(t.quanSoHienDien)}</TableCell>
      <TableCell className={td}>{formatNum(t.quanSoVang)}</TableCell>
      <TableCell className={td}>{formatNum(t.hoiThaiNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(t.hoiThaiEF)}</TableCell>
      <TableCell className={td}>{formatNum(t.xayDungNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(t.xayDungEF)}</TableCell>
      <TableCell className={td}>{formatNum(t.choHuu)}</TableCell>
      <TableCell className={td}>{formatNum(t.nghiTranhThu)}</TableCell>
      <TableCell className={td}>{formatNum(t.phep)}</TableCell>
      <TableCell className={td}>{formatNum(t.vienNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(t.vienEF)}</TableCell>
      <TableCell className={td}>{formatNum(t.congTacNgoaiSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(t.congTacSuDoan)}</TableCell>
      <TableCell className={td}>{formatNum(t.hocSQ)}</TableCell>
      <TableCell className={td}>{formatNum(t.hocCS)}</TableCell>
      <TableCell className={td}>{formatNum(t.lyDoVangKhac)}</TableCell>
      <TableCell className={td} />
      <TableCell className={td} />
      <TableCell className={td} />
      <TableCell className={td} />
    </TableRow>
  );
}
