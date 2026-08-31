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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { AbsentRow } from "@/types/dailyReport";
import type { DisplayTotals } from "../utils";
import { formatNum, LY_DO_OPTIONS } from "../utils";

const td = "border text-center font-bold tabular-nums break-words px-1";

const LY_DO_LABEL: Record<string, string> = Object.fromEntries(
  LY_DO_OPTIONS.map((o) => [o.value, o.label]),
);

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function ReportTotalRow({
  t,
  absentList = [],
}: {
  t: DisplayTotals;
  absentList?: AbsentRow[];
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const openDialog = () => {
    setPage(1);
    setOpen(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) setPage(1);
    setOpen(next);
  };

  const totalPages = Math.max(1, Math.ceil(absentList.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedAbsent = absentList.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

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
            onClick={openDialog}
          >
            <Eye className="size-4" />
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <>
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
                    {paginatedAbsent.map((m, i) => (
                      <TR key={m.id || i}>
                        <TC className="text-center text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </TC>
                        <TC>{m.tenDonVi || "—"}</TC>
                        <TC className="font-medium">{m.hoTen || "—"}</TC>
                        <TC>{m.capBac || "—"}</TC>
                        <TC>{m.chucVu || "—"}</TC>
                        <TC>
                          <span className="inline-block rounded bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                            {LY_DO_LABEL[m.lyDoVang] || m.lyDoVang || "—"}
                          </span>
                        </TC>
                        <TC>{m.ghiChu || "—"}</TC>
                      </TR>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between">
                <div className="mb-2 flex items-center">
                  <span className="mr-2 text-sm text-muted-foreground">
                    Hiển thị
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="ml-2 text-sm text-muted-foreground">
                    dòng
                  </span>
                </div>

                {totalPages > 1 && (
                  <div className="mb-2 rounded-lg border bg-background px-2 py-1">
                    <Pagination className="mx-0 w-auto justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            disabled={safePage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          />
                        </PaginationItem>

                        {getPageList(safePage, totalPages).map((p, i) =>
                          p === "…" ? (
                            <PaginationItem key={`e-${i}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={p}>
                              <PaginationLink
                                isActive={p === safePage}
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}

                        <PaginationItem>
                          <PaginationNext
                            disabled={safePage >= totalPages}
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
