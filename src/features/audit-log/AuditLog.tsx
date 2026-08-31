import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import SearchBar from "@/components/common/SearchBar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuditLogs } from "./queries";
import type { NhatKy } from "@/types/auditLog";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const HANH_DONG_OPTIONS = [
  { value: "ALL", label: "Tất cả hành động" },
  { value: "LOGIN", label: "Đăng nhập" },
  { value: "LOGOUT", label: "Đăng xuất" },
  { value: "CREATE", label: "Tạo mới" },
  { value: "UPDATE", label: "Cập nhật" },
  { value: "DELETE", label: "Xóa" },
  { value: "APPROVE", label: "Phê duyệt" },
  { value: "REJECT", label: "Từ chối" },
  { value: "LOCK", label: "Khóa" },
  { value: "UNLOCK", label: "Mở khóa" },
  { value: "UPDATE_FUNCTION", label: "Cập nhật chức năng" },
];

const TRANG_THAI_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "THANH_CONG", label: "Thành công" },
  { value: "THAT_BAI", label: "Thất bại" },
];

const HANH_DONG_LABEL: Record<string, string> = {
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  APPROVE: "Phê duyệt",
  REJECT: "Từ chối",
  LOCK: "Khóa",
  UNLOCK: "Mở khóa",
  UPDATE_FUNCTION: "Cập nhật chức năng",
};

const HANH_DONG_BADGE: Record<string, string> = {
  LOGIN: "bg-sky-100 text-sky-700",
  LOGOUT: "tone-neutral border",
  CREATE: "tone-success border",
  UPDATE: "tone-warning border",
  DELETE: "tone-danger border",
  APPROVE: "tone-success border",
  REJECT: "tone-danger border",
  LOCK: "tone-danger border",
  UNLOCK: "tone-success border",
  UPDATE_FUNCTION: "bg-violet-100 text-violet-700",
};

const TRANG_THAI_LABEL: Record<string, string> = {
  THANH_CONG: "Thành công",
  THAT_BAI: "Thất bại",
};

function getTaiKhoanText(taiKhoan: NhatKy["taiKhoan"]): string {
  if (!taiKhoan) return "—";
  if (typeof taiKhoan === "string") return taiKhoan;
  return (
    taiKhoan.tenTaiKhoan ||
    taiKhoan.tenDangNhap ||
    taiKhoan.donVi?.tenDonvi ||
    "—"
  );
}

function formatDatePart(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}
function formatTimePart(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN");
}

function getPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function AuditLog() {
  const topRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [filterHanhDong, setFilterHanhDong] = useState("ALL");
  const [filterTrangThai, setFilterTrangThai] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasFilter =
    search.trim() !== "" ||
    filterHanhDong !== "ALL" ||
    filterTrangThai !== "ALL";

  const clearFilter = () => {
    setSearch("");
    setFilterHanhDong("ALL");
    setFilterTrangThai("ALL");
    setPage(1);
  };

  const payload = useMemo(
    () => ({
      taiKhoan: search.trim(),
      hanhDong: filterHanhDong === "ALL" ? "" : filterHanhDong,
      trangThai: filterTrangThai === "ALL" ? "" : filterTrangThai,
    }),
    [search, filterHanhDong, filterTrangThai],
  );

  const { data, isLoading, isFetching } = useAuditLogs(payload, {
    page: page - 1,
    size: pageSize,
    sortBy: "createdAt",
    direction: "DESC",
  });

  const logs = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const safePage = Math.min(page, totalPages);

  const goToPage = (updater: number | ((p: number) => number)) => {
    setPage(updater);
    topRef.current
      ?.closest(".overflow-y-auto")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loading = isLoading || isFetching;

  return (
    <div ref={topRef}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Nhật ký hệ thống</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tìm theo tài khoản..."
          className="mb-2 mr-3 w-full sm:w-96"
        />
        <Select
          value={filterHanhDong}
          onValueChange={(v) => {
            setFilterHanhDong(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="mb-2 mr-3 w-56">
            <SelectValue placeholder="Tất cả hành động" />
          </SelectTrigger>
          <SelectContent>
            {HANH_DONG_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterTrangThai}
          onValueChange={(v) => {
            setFilterTrangThai(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="mb-2 mr-3 w-48">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {TRANG_THAI_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="outline" className="mb-2" onClick={clearFilter}>
            <X className="mr-2 size-4" /> Xóa lọc
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px] text-center">#</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead className="w-[140px]">Hành động</TableHead>
              <TableHead className="w-[160px]">Thời gian</TableHead>
              <TableHead className="w-[140px]">Đối tượng</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[120px] text-center">
                Trạng thái
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map(
                (_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasFilter ? "Không tìm thấy nhật ký" : "Chưa có nhật ký"}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log.idNhatKy}>
                  <TableCell className="text-center text-muted-foreground">
                    {(safePage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTaiKhoanText(log.taiKhoan)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-sm font-medium ${
                        HANH_DONG_BADGE[log.hanhDong] ??
                        "bg-slate-100 text-muted-foreground"
                      }`}
                    >
                      {HANH_DONG_LABEL[log.hanhDong] ?? log.hanhDong}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDatePart(log.createdAt)}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimePart(log.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{log.doiTuong || "—"}</TableCell>
                  <TableCell className="max-w-[360px] whitespace-pre-wrap break-words">
                    {log.moTa || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-sm font-medium ${
                        log.trangThai === "THANH_CONG"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {TRANG_THAI_LABEL[log.trangThai] ?? log.trangThai}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            setPageSize(Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="mb-2 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                Hiển thị {n} dòng
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {totalPages > 1 && (
          <div className="mb-2 rounded-lg border bg-background px-2 py-1">
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={safePage <= 1}
                    onClick={() => goToPage((p) => Math.max(1, p - 1))}
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
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    disabled={safePage >= totalPages}
                    onClick={() => goToPage((p) => Math.min(totalPages, p + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
