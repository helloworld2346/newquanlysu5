import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import SearchBar from "@/components/common/SearchBar";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  useCaTrucList,
  useTrucChiHuy,
  useTrucBanTacChien,
  useUpdateCaTruc,
} from "./queries";
import type { CaTrucDetail, NguoiTrucWithCaTruc } from "@/types/duty";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));

function getYearOptions() {
  const cur = new Date().getFullYear();
  const years: { value: string; label: string }[] = [];
  for (let y = cur - 2; y <= cur + 1; y++)
    years.push({ value: String(y), label: String(y) });
  return years;
}
const YEAR_OPTIONS = getYearOptions();

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function nguoiTrucLabel(p: NguoiTrucWithCaTruc): string {
  return [p.capbacNguoitruc, p.tenNguoitruc, p.chucvuNguoitruc]
    .filter(Boolean)
    .join(" - ");
}

const PROVINCES = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Điện Biên",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hưng Yên",
  "Huế",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
  "Hồ Chí Minh",
];
function generateMatKhau(): string {
  const a = Math.floor(Math.random() * PROVINCES.length);
  let b = Math.floor(Math.random() * PROVINCES.length);
  while (b === a) b = Math.floor(Math.random() * PROVINCES.length);
  return `${PROVINCES[a]} - ${PROVINCES[b]}`;
}

function getPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

interface EditForm {
  trucChiHuy: string;
  trucBanTacChien: string;
  matkhau: string;
  ghichu: string;
  ngaytruc: string;
}
interface EditErrors {
  trucChiHuy?: string;
  trucBanTacChien?: string;
  matkhau?: string;
}

export default function DutyShifts() {
  const { data: shifts = [], isLoading } = useCaTrucList();
  const { data: chiHuyList = [] } = useTrucChiHuy();
  const { data: tacChienList = [] } = useTrucBanTacChien();
  const updateCaTruc = useUpdateCaTruc();

  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const topRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState<CaTrucDetail | null>(null);
  const [form, setForm] = useState<EditForm>({
    trucChiHuy: "",
    trucBanTacChien: "",
    matkhau: "",
    ghichu: "",
    ngaytruc: "",
  });
  const [errors, setErrors] = useState<EditErrors>({});
  const [confirmSave, setConfirmSave] = useState(false);

  const filterPrefix = `${filterYear}-${String(filterMonth).padStart(2, "0")}`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...shifts]
      .filter((s) => {
        if (!s.ngaytruc.startsWith(filterPrefix)) return false;
        if (q) {
          const ch =
            `${s.trucChiHuy?.capbacNguoitruc ?? ""} ${s.trucChiHuy?.tenNguoitruc ?? ""}`.toLowerCase();
          const tc =
            `${s.trucBanTacChien?.capbacNguoitruc ?? ""} ${s.trucBanTacChien?.tenNguoitruc ?? ""}`.toLowerCase();
          if (!ch.includes(q) && !tc.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.ngaytruc.localeCompare(a.ngaytruc));
  }, [shifts, filterPrefix, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const goToPage = (p: number | ((prev: number) => number)) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openEdit = (s: CaTrucDetail) => {
    setEditing(s);
    setErrors({});
    setForm({
      trucChiHuy: s.trucChiHuy?.idNguoitruc ?? "",
      trucBanTacChien: s.trucBanTacChien?.idNguoitruc ?? "",
      matkhau: s.matkhau ?? "",
      ghichu: s.ghichu ?? "",
      ngaytruc: s.ngaytruc,
    });
  };

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.trucChiHuy) e.trucChiHuy = "Vui lòng chọn trực chỉ huy";
    if (!form.trucBanTacChien)
      e.trucBanTacChien = "Vui lòng chọn trực ban tác chiến";
    if (
      form.trucChiHuy &&
      form.trucBanTacChien &&
      form.trucChiHuy === form.trucBanTacChien
    )
      e.trucBanTacChien = "Không được trùng với trực chỉ huy";
    if (!form.matkhau.trim()) e.matkhau = "Vui lòng nhập mật khẩu ca trực";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveClick = () => {
    if (validate()) setConfirmSave(true);
  };

  const doSave = async () => {
    if (!editing) return;
    try {
      await updateCaTruc.mutateAsync({
        id: editing.idCatruc,
        body: {
          ngaytruc: form.ngaytruc,
          matkhau: form.matkhau,
          ghichu: form.ghichu,
          trucChiHuy: form.trucChiHuy,
          trucBanTacChien: form.trucBanTacChien,
        },
      });
      toast.success("Cập nhật ca trực thành công");
      setConfirmSave(false);
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const renderPerson = (p: CaTrucDetail["trucChiHuy"]) =>
    p ? (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{p.tenNguoitruc}</span>
        <span className="text-sm text-muted-foreground">
          {[p.capbacNguoitruc, p.chucvuNguoitruc].filter(Boolean).join(" · ")}
        </span>
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <div ref={topRef}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lịch sử ca trực</h1>
        <span className="mb-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {filtered.length} ca trực
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center">
        <div className="mb-2 mr-3 flex items-center">
          <Select
            value={String(filterMonth)}
            onValueChange={(v) => {
              setFilterMonth(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="mr-2 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(filterYear)}
            onValueChange={(v) => {
              setFilterYear(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên người trực..."
          className="mb-2 w-full sm:w-80"
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Ngày trực</TableHead>
              <TableHead>Trực chỉ huy</TableHead>
              <TableHead>Trực ban tác chiến</TableHead>
              <TableHead>Mật khẩu</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto size-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có ca trực nào trong tháng này
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((s) => (
                <TableRow key={s.idCatruc}>
                  <TableCell className="font-medium">
                    {formatDate(s.ngaytruc)}
                  </TableCell>
                  <TableCell>{renderPerson(s.trucChiHuy)}</TableCell>
                  <TableCell>{renderPerson(s.trucBanTacChien)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {s.matkhau || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.ghichu || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(s)}
                    >
                      <Pencil className="mr-1 size-4" />
                    </Button>
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

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa ca trực
              {editing ? ` — ${formatDate(editing.ngaytruc)}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Trực chỉ huy
              </label>
              <Select
                value={form.trucChiHuy}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, trucChiHuy: v }));
                  setErrors((p) => ({ ...p, trucChiHuy: undefined }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Chọn trực chỉ huy --" />
                </SelectTrigger>
                <SelectContent>
                  {chiHuyList.map((p) => (
                    <SelectItem key={p.idNguoitruc} value={p.idNguoitruc}>
                      {nguoiTrucLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.trucChiHuy && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.trucChiHuy}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Trực ban tác chiến
              </label>
              <Select
                value={form.trucBanTacChien}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, trucBanTacChien: v }));
                  setErrors((p) => ({ ...p, trucBanTacChien: undefined }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Chọn trực ban tác chiến --" />
                </SelectTrigger>
                <SelectContent>
                  {tacChienList.map((p) => (
                    <SelectItem key={p.idNguoitruc} value={p.idNguoitruc}>
                      {nguoiTrucLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.trucBanTacChien && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.trucBanTacChien}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Mật khẩu <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center">
                <Input
                  className="mr-2"
                  value={form.matkhau}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, matkhau: e.target.value }));
                    setErrors((p) => ({ ...p, matkhau: undefined }));
                  }}
                  placeholder="Nhập mật khẩu..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm((f) => ({ ...f, matkhau: generateMatKhau() }));
                    setErrors((p) => ({ ...p, matkhau: undefined }));
                  }}
                >
                  <Dices className="mr-1 size-4" /> Ngẫu nhiên
                </Button>
              </div>
              {errors.matkhau && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.matkhau}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Ghi chú</label>
              <Input
                value={form.ghichu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ghichu: e.target.value }))
                }
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Hủy
            </Button>
            <Button onClick={handleSaveClick} disabled={updateCaTruc.isPending}>
              {updateCaTruc.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSave}
        onOpenChange={setConfirmSave}
        title="Xác nhận lưu ca trực"
        description="Bạn có chắc chắn muốn lưu thay đổi ca trực này?"
        confirmText="Lưu"
        loading={updateCaTruc.isPending}
        onConfirm={doSave}
      />
    </div>
  );
}
