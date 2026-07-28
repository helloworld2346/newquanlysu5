import { useState } from "react";
import { Eye } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell as TC,
  TableHead,
  TableHeader,
  TableRow as TR,
} from "@/components/ui/table";
import type { AbsentRow } from "@/types/dailyReport";
import type { DisplayTotals } from "../utils";
import { formatNum, LY_DO_OPTIONS } from "../utils";

const td = "border text-center font-bold tabular-nums break-words px-1";

const LY_DO_LABEL: Record<string, string> = Object.fromEntries(
  LY_DO_OPTIONS.map((o) => [o.value, o.label]),
);

export default function ReportTotalRow({
  t,
  absentList = [],
}: {
  t: DisplayTotals;
  absentList?: AbsentRow[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
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
        <TableCell className={td}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Xem chi tiết quân số vắng"
            disabled={absentList.length === 0}
            onClick={() => setOpen(true)}
          >
            <Eye className="size-4" />
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chi tiết quân số vắng ({formatNum(absentList.length)})
            </DialogTitle>
          </DialogHeader>
          {absentList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có quân nhân vắng.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="w-full">
                <TableHeader>
                  <TR className="bg-muted/50">
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Cấp bậc</TableHead>
                    <TableHead>Chức vụ</TableHead>
                    <TableHead>Lý do vắng</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TR>
                </TableHeader>
                <TableBody>
                  {absentList.map((m, i) => (
                    <TR key={m.id || i}>
                      <TC className="text-center text-muted-foreground">
                        {i + 1}
                      </TC>
                      <TC>{m.tenDonVi || "—"}</TC>
                      <TC className="font-medium">{m.hoTen || "—"}</TC>
                      <TC>{m.capBac || "—"}</TC>
                      <TC>{m.chucVu || "—"}</TC>
                      <TC>
                        <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-amber-700">
                          {LY_DO_LABEL[m.lyDoVang] || m.lyDoVang || "—"}
                        </span>
                      </TC>
                      <TC>{m.ghiChu || "—"}</TC>
                    </TR>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
