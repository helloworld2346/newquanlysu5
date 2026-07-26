import { useMemo, useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  LockOpen,
  MoreHorizontal,
  Key,
  SlidersHorizontal,
} from "lucide-react";  
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
import SearchBar from "@/components/common/SearchBar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  useAccounts,
  useDonViList,
  useRoleList,
  useDeleteAccount,
  useToggleLock,
} from "./queries";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AccountFormDialog from "./AccountFormDialog";
import type { Account } from "@/types/account";
import ResetPasswordDialog from "./ResetPasswordDialog";
import ChucNangDialog from "./ChucNangDialog";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function AccountManagement() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: donViList = [] } = useDonViList();
  const { data: roleList = [] } = useRoleList();
  const deleteAccount = useDeleteAccount();
  const toggleLock = useToggleLock();

  const [search, setSearch] = useState("");
  const [filterVaiTro, setFilterVaiTro] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const topRef = useRef<HTMLDivElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [resetAccount, setResetAccount] = useState<Account | null>(null);
  const [chucNangAccount, setChucNangAccount] = useState<Account | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (q) {
        const hit =
          a.tenTaiKhoan.toLowerCase().includes(q) ||
          a.tenDangNhap.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterVaiTro !== "ALL" && a.vaiTro?.idVaiTro !== filterVaiTro)
        return false;
      return true;
    });
  }, [accounts, search, filterVaiTro]);

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
    setEditingAccount(null);
    setDialogOpen(true);
  };
  const openEdit = (acc: Account) => {
    setEditingAccount(acc);
    setDialogOpen(true);
  };

    function getPageList(current: number, total: number): (number | "…")[] {
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
      if (current >= total - 3)
        return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
      return [1, "…", current - 1, current, current + 1, "…", total];
    }

  const handleDelete = async (acc: Account) => {
    if (!window.confirm(`Xóa tài khoản "${acc.tenTaiKhoan}"?`)) return;
    try {
      await deleteAccount.mutateAsync(acc.idTaiKhoan);
      toast.success("Xóa tài khoản thành công");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleToggleLock = async (acc: Account) => {
    try {
      await toggleLock.mutateAsync({ id: acc.idTaiKhoan, locked: acc.khoa });
      toast.success(acc.khoa ? "Đã mở khóa" : "Đã khóa tài khoản");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div ref={topRef}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý tài khoản</h1>
        <Button onClick={openCreate}>
          <Plus />
          Thêm tài khoản
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên tài khoản / tên đăng nhập..."
          className="mb-2 mr-3 w-96"
        />
        <Select
          value={filterVaiTro}
          onValueChange={(v) => {
            setFilterVaiTro(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="mb-2 w-56">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả vai trò</SelectItem>
            {roleList
              .filter((r) => r.idVaiTro)
              .map((r) => (
                <SelectItem key={r.idVaiTro!} value={r.idVaiTro!}>
                  {r.tenVaiTro}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px] text-center">#</TableHead>
              <TableHead>Tài khoản</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead className="w-[120px] text-center">
                Trạng thái
              </TableHead>
              <TableHead className="w-[160px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {search || filterVaiTro !== "ALL"
                    ? "Không tìm thấy tài khoản"
                    : "Chưa có tài khoản"}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((a, index) => (
                <TableRow key={a.idTaiKhoan}>
                  <TableCell className="text-center text-muted-foreground">
                    {(safePage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{a.tenTaiKhoan}</TableCell>
                  <TableCell>{a.tenDangNhap}</TableCell>
                  <TableCell>{a.vaiTro?.tenVaiTro ?? "—"}</TableCell>
                  <TableCell>{a.donVi?.tenDonvi ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    {a.khoa ? (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                        Đã khóa
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Hoạt động
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title="Thao tác">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => openEdit(a), 0);
                          }}
                        >
                          <Pencil />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleLock(a)}>
                          {a.khoa ? <LockOpen /> : <Lock />}
                          {a.khoa ? "Mở khóa" : "Khóa"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => setResetAccount(a), 0);
                          }}
                        >
                          <Key />
                          Reset mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => setChucNangAccount(a), 0);
                          }}
                        >
                          <SlidersHorizontal />
                          Đổi chức năng
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(a)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 />
                          Xóa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingAccount={editingAccount}
        donViList={donViList}
        roleList={roleList}
        onSaved={() => setPage(1)}
      />
      <ResetPasswordDialog
        key={`reset-${resetAccount?.idTaiKhoan ?? "none"}`}
        open={!!resetAccount}
        onOpenChange={(v) => !v && setResetAccount(null)}
        account={resetAccount}
      />
      <ChucNangDialog
        key={`cn-${chucNangAccount?.idTaiKhoan ?? "none"}`}
        open={!!chucNangAccount}
        onOpenChange={(v) => !v && setChucNangAccount(null)}
        account={chucNangAccount}
      />
    </div>
  );
}
