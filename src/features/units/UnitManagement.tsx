import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  X,
  Building2,
  Briefcase,
  ShieldCheck,
  Flag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useUnits } from "./queries";
import UnitFormDialog from "./UnitFormDialog";
import type { DonVi } from "@/types/account";

const CAP_LABELS: Record<string, string> = {
  SU_DOAN: "Sư đoàn",
  TRUNG_DOAN: "Trung đoàn",
  TIEU_DOAN: "Tiểu đoàn",
  DAI_DOI: "Đại đội",
  PHONG: "Phòng",
};
const CAP_OPTIONS = Object.entries(CAP_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TOTAL_STAT = {
  label: "Tổng đơn vị",
  icon: Building2,
  color: "bg-emerald-500",
};

const STAT_CAPS: {
  cap: string;
  label: string;
  icon: typeof Building2;
  color: string;
}[] = [
  {
    cap: "PHONG",
    label: "Phòng",
    icon: Briefcase,
    color: "bg-blue-500",
  },
  {
    cap: "TRUNG_DOAN",
    label: "Trung đoàn",
    icon: ShieldCheck,
    color: "bg-amber-500",
  },
  {
    cap: "TIEU_DOAN",
    label: "Tiểu đoàn",
    icon: Flag,
    color: "bg-rose-500",
  },
  {
    cap: "DAI_DOI",
    label: "Đại đội",
    icon: Users,
    color: "bg-violet-500",
  },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function UnitManagement() {
  const { data: units = [], isLoading } = useUnits();

  const [search, setSearch] = useState("");
  const [filterCap, setFilterCap] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const topRef = useRef<HTMLDivElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingUnit = useMemo(
    () => units.find((u) => u.maDonVi === editingId) ?? null,
    [units, editingId],
  );

  const directChildren = useMemo(() => {
    const rootCode =
      units.find((u) => u.donViCha === null)?.maDonVi ??
      units.find((u) => u.capDonVi === "SU_DOAN")?.maDonVi ??
      "";
    if (!rootCode) return [];
    const prefix = `${rootCode}.`;
    return units.filter((u) => {
      if (!u.maDonVi.startsWith(prefix)) return false;
      const rest = u.maDonVi.slice(prefix.length);
      return rest.length > 0 && !rest.includes(".");
    });
  }, [units]);

  const capCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const u of directChildren) {
      const key = u.capDonVi ?? "";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [directChildren]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const goToPage = (updater: number | ((p: number) => number)) => {
    setPage(updater);
    topRef.current
      ?.closest(".overflow-y-auto")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCreate = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (u: DonVi) => {
    setEditingId(u.maDonVi);
    setDialogOpen(true);
  };

  function getPageList(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3)
      return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  }

  return (
    <div ref={topRef}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý đơn vị</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Thêm đơn vị
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <div className="p-1.5">
          <Card className="h-full shadow-md transition-shadow hover:shadow-lg">
            <CardContent className="flex min-h-[84px] items-center p-5">
              <div
                className={`mr-4 grid size-12 shrink-0 place-items-center rounded-xl text-white ${TOTAL_STAT.color}`}
              >
                <TOTAL_STAT.icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="mb-1 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {TOTAL_STAT.label}
                </p>
                <strong className="block text-2xl font-extrabold leading-none tabular-nums">
                  {directChildren.length}
                </strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {STAT_CAPS.map(({ cap, label, icon: Icon, color }) => (
          <div key={cap} className="p-1.5">
            <Card className="h-full shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex min-h-[84px] items-center p-5">
                <div
                  className={`mr-4 grid size-12 shrink-0 place-items-center rounded-xl text-white ${color}`}
                >
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <strong className="block text-2xl font-extrabold leading-none tabular-nums">
                    {capCounts[cap] ?? 0}
                  </strong>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
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

      <div className="overflow-hidden rounded-lg border bg-background">
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
                    {(safePage - 1) * pageSize + index + 1}
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

      {!isLoading && filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between">
          <div className="mb-2 flex items-center">
            <span className="mr-2 text-sm text-muted-foreground">Hiển thị</span>
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
            <span className="ml-2 text-sm text-muted-foreground">dòng</span>
          </div>

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
                      onClick={() =>
                        goToPage((p) => Math.min(totalPages, p + 1))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      <UnitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUnit={editingUnit}
        units={units}
        onCreated={() => setPage(1)}
      />
    </div>
  );
}
