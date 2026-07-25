import { useMemo, useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { getErrorMessage } from "@/lib/errorHandler";
import { useUnits, useCreateUnit, useUpdateUnit } from "./queries";
import type { DonVi } from "@/types/account";

const CAP_LABELS: Record<string, string> = {
  SU_DOAN: "Sư đoàn",
  TRUNG_DOAN: "Trung đoàn",
  TIEU_DOAN: "Tiểu đoàn",
  DAI_DOI: "Đại đội",
  PHONG: "Phòng",
  BAN: "Ban",
};
const CAP_OPTIONS = Object.entries(CAP_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const PAGE_SIZE = 10;
const toInt = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
};

type FormState = {
  tenDonvi: string;
  kyhieuDonvi: string;
  capDonVi: string;
  donViCha: string;
  quanSoTong: string;
  quanSoHsqBs: string;
  quanSoSiQuan: string;
  quanSoQncn: string;
};
const EMPTY_FORM: FormState = {
  tenDonvi: "",
  kyhieuDonvi: "",
  capDonVi: "",
  donViCha: "",
  quanSoTong: "0",
  quanSoHsqBs: "0",
  quanSoSiQuan: "0",
  quanSoQncn: "0",
};

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export default function UnitManagement() {
  const { data: units = [], isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const [search, setSearch] = useState("");
  const [filterCap, setFilterCap] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });

  const editingUnit = useMemo(
    () => units.find((u) => u.maDonVi === editingId),
    [units, editingId],
  );

  const parentOptions = useMemo(
    () => units.map((u) => ({ value: u.maDonVi, label: u.tenDonvi })),
    [units],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u) => {
      if (q) {
        const hit =
          u.tenDonvi.toLowerCase().includes(q) ||
          u.kyhieuDonvi.toLowerCase().includes(q) ||
          u.maDonVi.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterCap && u.capDonVi !== filterCap) return false;
      return true;
    });
  }, [units, search, filterCap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const setField = (k: keyof FormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (u: DonVi) => {
    const parent = units.find((x) => x.tenDonvi === u.donViCha);
    setEditingId(u.maDonVi);
    setForm({
      tenDonvi: u.tenDonvi,
      kyhieuDonvi: u.kyhieuDonvi,
      capDonVi: u.capDonVi ?? "",
      donViCha: parent ? parent.maDonVi : "",
      quanSoTong: String(u.quanSoTong),
      quanSoHsqBs: String(u.quanSoHsqBs),
      quanSoSiQuan: String(u.quanSoSiQuan),
      quanSoQncn: String(u.quanSoQncn),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.tenDonvi.trim()) return toast.error("Vui lòng nhập tên đơn vị");
    if (!form.kyhieuDonvi.trim()) return toast.error("Vui lòng nhập ký hiệu");
    if (!form.capDonVi) return toast.error("Vui lòng chọn cấp đơn vị");

    const base = {
      tenDonvi: form.tenDonvi.trim(),
      kyhieuDonvi: form.kyhieuDonvi.trim(),
      capDonVi: form.capDonVi,
      donViCha: form.donViCha,
      quanSoTong: toInt(form.quanSoTong),
      quanSoHsqBs: toInt(form.quanSoHsqBs),
      quanSoSiQuan: toInt(form.quanSoSiQuan),
      quanSoQncn: toInt(form.quanSoQncn),
    };

    try {
      if (editingId && editingUnit) {
        const res = await updateUnit.mutateAsync({
          id: editingId,
          data: {
            ...base,
            createdAt: editingUnit.createdAt,
            updatedAt: new Date().toISOString(),
            isDeleted: editingUnit.isDeleted,
            deletedAt: editingUnit.deletedAt,
          },
        });
        if (!res.success) throw new Error(res.message);
        toast.success("Cập nhật đơn vị thành công");
      } else {
        const res = await createUnit.mutateAsync({ ...base, donViCon: [] });
        if (!res.success) throw new Error(res.message);
        toast.success("Tạo đơn vị thành công");
        setPage(1);
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể lưu đơn vị"));
    }
  };

  const saving = createUnit.isPending || updateUnit.isPending;

  function getPageList(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3)
      return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý đơn vị</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Thêm đơn vị
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên / ký hiệu / mã đơn vị..."
          className="mb-2 mr-2 w-full sm:w-96"
        />
        <Select
          value={filterCap || "ALL"}
          onValueChange={(v) => {
            setFilterCap(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="mb-2 mr-2 w-[180px]">
            <SelectValue placeholder="Tất cả cấp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả cấp</SelectItem>
            {CAP_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || filterCap) && (
          <Button
            variant="outline"
            className="mb-2"
            onClick={() => {
              setSearch("");
              setFilterCap("");
              setPage(1);
            }}
          >
            <X className="mr-2 size-4" />
            Xóa lọc
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table className="min-w-[1120px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px] text-center">#</TableHead>
              <TableHead className="w-[180px]">Mã đơn vị</TableHead>
              <TableHead className="w-[200px]">Tên đơn vị</TableHead>
              <TableHead className="w-[140px]">Cấp</TableHead>
              <TableHead className="w-[80px]">Ký hiệu</TableHead>
              <TableHead className="w-[100px] text-center">Quân số</TableHead>
              <TableHead className="w-[80px] text-center">SQ</TableHead>
              <TableHead className="w-[80px] text-center">QNCN</TableHead>
              <TableHead className="w-[80px] text-center">HSQ/BS</TableHead>
              <TableHead className="w-[100px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có đơn vị nào
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((u, index) => (
                <TableRow key={u.maDonVi}>
                  <TableCell className="text-center text-muted-foreground">
                    {(safePage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell className="truncate font-medium" title={u.maDonVi}>
                    {u.maDonVi}
                  </TableCell>
                  <TableCell className="truncate" title={u.tenDonvi}>
                    {u.tenDonvi}
                  </TableCell>
                  <TableCell
                    className="truncate"
                    title={CAP_LABELS[u.capDonVi ?? ""] ?? u.capDonVi ?? "—"}
                  >
                    {CAP_LABELS[u.capDonVi ?? ""] ?? u.capDonVi ?? "—"}
                  </TableCell>
                  <TableCell className="truncate" title={u.kyhieuDonvi}>
                    {u.kyhieuDonvi}
                  </TableCell>
                  <TableCell className="text-center font-semibold tabular-nums">
                    {u.quanSoTong}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {u.quanSoSiQuan}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {u.quanSoQncn}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {u.quanSoHsqBs}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(u)}
                      aria-label="Sửa"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && filtered.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Cập nhật đơn vị" : "Thêm đơn vị"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <Field label="Tên đơn vị *">
              <input
                className={inputCls}
                value={form.tenDonvi}
                onChange={(e) => setField("tenDonvi", e.target.value)}
              />
            </Field>
            <Field label="Ký hiệu *">
              <input
                className={inputCls}
                value={form.kyhieuDonvi}
                onChange={(e) => setField("kyhieuDonvi", e.target.value)}
              />
            </Field>
            <Field label="Cấp đơn vị *">
              <select
                className={inputCls}
                value={form.capDonVi}
                onChange={(e) => setField("capDonVi", e.target.value)}
              >
                <option value="">-- Chọn cấp --</option>
                {CAP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Đơn vị cha">
              <select
                className={inputCls}
                value={form.donViCha}
                onChange={(e) => setField("donViCha", e.target.value)}
                disabled={!!editingId}
              >
                <option value="">-- Không có (đơn vị gốc) --</option>
                {parentOptions
                  .filter((o) => o.value !== editingId)
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Quân số tổng">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.quanSoTong}
                onChange={(e) => setField("quanSoTong", e.target.value)}
              />
            </Field>
            <Field label="HSQ-BS">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.quanSoHsqBs}
                onChange={(e) => setField("quanSoHsqBs", e.target.value)}
              />
            </Field>
            <Field label="Sĩ quan">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.quanSoSiQuan}
                onChange={(e) => setField("quanSoSiQuan", e.target.value)}
              />
            </Field>
            <Field label="QNCN">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.quanSoQncn}
                onChange={(e) => setField("quanSoQncn", e.target.value)}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving
                ? "Đang lưu..."
                : editingId
                  ? "Lưu thay đổi"
                  : "Tạo đơn vị"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 px-2">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
