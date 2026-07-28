import { useMemo, useState, useRef } from "react";
import { Plus, SquarePen, Trash2, MoreHorizontal, X } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBar from "@/components/common/SearchBar";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import RoleFormDialog from "./RoleFormDialog";
import { useRoles, useDeleteRole } from "./queries";
import { getErrorMessage } from "@/lib/errorHandler";
import { CHUC_NANG_OPTIONS } from "@/config/navigation";
import type { Role } from "@/types/account";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const CHUC_NANG_LABEL: Record<string, string> = Object.fromEntries(
  CHUC_NANG_OPTIONS.map((o) => [o.value, o.label]),
);
const getChucNangLabel = (key: string) => CHUC_NANG_LABEL[key] ?? key;

export default function RoleManagement() {
  const { data: roles = [], isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const topRef = useRef<HTMLDivElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

  const hasFilter = search.trim() !== "";
  const clearFilter = () => {
    setSearch("");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => (r.tenVaiTro ?? "").toLowerCase().includes(q));
  }, [roles, search]);

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
    setEditingRole(null);
    setDialogOpen(true);
  };
  const openEdit = (r: Role) => {
    setEditingRole(r);
    setDialogOpen(true);
  };

  function getPageList(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
    if (current >= total - 3)
      return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "…", current - 1, current, current + 1, "…", total];
  }

  const doDelete = async (r: Role) => {
    if (!r.idVaiTro) return;
    try {
      await deleteRole.mutateAsync(r.idVaiTro);
      toast.success("Xóa vai trò thành công");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div ref={topRef}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý vai trò</h1>
        <Button onClick={openCreate}>
          <Plus />
          Thêm vai trò
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên vai trò..."
          className="mb-2 mr-3 w-96"
        />
        {hasFilter && (
          <Button variant="outline" className="mb-2" onClick={clearFilter}>
            <X className="mr-2 size-4" /> Xóa lọc
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px] text-center">#</TableHead>
              <TableHead className="w-[240px]">Tên vai trò</TableHead>
              <TableHead>Chức năng</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map(
                (_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasFilter ? "Không tìm thấy vai trò" : "Chưa có vai trò"}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((r, index) => (
                <TableRow key={r.idVaiTro}>
                  <TableCell className="text-center text-muted-foreground">
                    {(safePage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {r.tenVaiTro ?? "—"}
                  </TableCell>
                  <TableCell>
                    {r.tenChucnang && r.tenChucnang.length > 0 ? (
                      <div className="-mx-0.5 flex flex-wrap">
                        {r.tenChucnang.map((c) => (
                          <span
                            key={c}
                            className="mx-0.5 my-0.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary"
                          >
                            {getChucNangLabel(c)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title="Thao tác">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => openEdit(r), 0);
                          }}
                        >
                          <SquarePen />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => setConfirmDelete(r), 0);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRole={editingRole}
        onSaved={() => setPage(1)}
      />

      <ConfirmDialog
        key={`del-${confirmDelete?.idVaiTro ?? "none"}`}
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Xóa vai trò"
        description={
          confirmDelete
            ? `Bạn có chắc muốn xóa vai trò "${confirmDelete.tenVaiTro}"? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xóa"
        destructive
        onConfirm={() => {
          if (confirmDelete) doDelete(confirmDelete);
        }}
      />
    </div>
  );
}
