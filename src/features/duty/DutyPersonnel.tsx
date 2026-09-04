import { useMemo, useState } from "react";
import { UsersRound, Plus, SquarePen, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import SearchBar from "@/components/common/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  useTrucChiHuy,
  useTrucBanTacChien,
  useCreateNguoiTruc,
  useUpdateNguoiTruc,
  useDeleteNguoiTruc,
} from "./queries";
import type { NguoiTrucWithCaTruc, TrucNguoiPayload } from "@/types/duty";

type DutyType = "chiHuy" | "tacChien";

const CHI_HUY_CAP_BAC = ["Đại tá", "Thượng tá", "Trung tá"];
const CHI_HUY_CHUC_VU = [
  "Sư đoàn trưởng",
  "Phó Sư đoàn trưởng - TMT",
  "Phó Sư đoàn trưởng",
];
const TAC_CHIEN_CAP_BAC = [
  "Trung tá",
  "Thiếu tá",
  "Đại úy",
  "Thượng úy",
  "Trung úy",
  "Thiếu úy",
];
const TAC_CHIEN_CHUC_VU = ["Trợ lý tác chiến"];

const EMPTY_FORM: TrucNguoiPayload = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

type FormErrors = Partial<
  Record<"tenNguoitruc" | "capbacNguoitruc" | "chucvuNguoitruc", string>
>;

function validateForm(f: TrucNguoiPayload): FormErrors {
  const errs: FormErrors = {};
  if (!f.tenNguoitruc.trim()) errs.tenNguoitruc = "Vui lòng nhập họ và tên";
  if (!f.capbacNguoitruc) errs.capbacNguoitruc = "Vui lòng chọn cấp bậc";
  if (!f.chucvuNguoitruc) errs.chucvuNguoitruc = "Vui lòng chọn chức vụ";
  return errs;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

const sortByNewest = (arr: NguoiTrucWithCaTruc[]) =>
  [...arr].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export default function DutyPersonnel() {
  const { data: chiHuyRaw = [], isLoading: loadingChiHuy } = useTrucChiHuy();
  const { data: tacChienRaw = [], isLoading: loadingTacChien } =
    useTrucBanTacChien();
  const createNguoiTruc = useCreateNguoiTruc();
  const updateNguoiTruc = useUpdateNguoiTruc();
  const deleteNguoiTruc = useDeleteNguoiTruc();

  const chiHuyList = useMemo(() => sortByNewest(chiHuyRaw), [chiHuyRaw]);
  const tacChienList = useMemo(() => sortByNewest(tacChienRaw), [tacChienRaw]);

  const [search, setSearch] = useState("");

  // form thêm
  const [dutyType, setDutyType] = useState<DutyType>("chiHuy");
  const [form, setForm] = useState<TrucNguoiPayload>({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // dialog sửa
  const [editing, setEditing] = useState<{
    person: NguoiTrucWithCaTruc;
    type: DutyType;
  } | null>(null);
  const [editForm, setEditForm] = useState<TrucNguoiPayload>({ ...EMPTY_FORM });
  const [editErrors, setEditErrors] = useState<FormErrors>({});

  // xác nhận xóa
  const [confirmDelete, setConfirmDelete] = useState<{
    person: NguoiTrucWithCaTruc;
    type: DutyType;
  } | null>(null);

  const capBacOptions =
    dutyType === "chiHuy" ? CHI_HUY_CAP_BAC : TAC_CHIEN_CAP_BAC;
  const chucVuOptions =
    dutyType === "chiHuy" ? CHI_HUY_CHUC_VU : TAC_CHIEN_CHUC_VU;
  const editCapBac =
    editing?.type === "chiHuy" ? CHI_HUY_CAP_BAC : TAC_CHIEN_CAP_BAC;
  const editChucVu =
    editing?.type === "chiHuy" ? CHI_HUY_CHUC_VU : TAC_CHIEN_CHUC_VU;

  const handleDutyTypeChange = (type: DutyType) => {
    setDutyType(type);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  const handleAdd = () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    createNguoiTruc.mutate(
      { type: dutyType, body: form },
      {
        onSuccess: () => {
          toast.success(
            dutyType === "chiHuy"
              ? "Thêm trực chỉ huy thành công"
              : "Thêm trực ban tác chiến thành công",
          );
          setForm({ ...EMPTY_FORM });
          setFormErrors({});
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const startEdit = (person: NguoiTrucWithCaTruc, type: DutyType) => {
    setEditing({ person, type });
    setEditForm({
      tenNguoitruc: person.tenNguoitruc,
      capbacNguoitruc: person.capbacNguoitruc,
      chucvuNguoitruc: person.chucvuNguoitruc,
      sodienthoai: person.sodienthoai ?? "",
    });
    setEditErrors({});
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const errs = validateForm(editForm);
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    updateNguoiTruc.mutate(
      { type: editing.type, id: editing.person.idNguoitruc, body: editForm },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công");
          setEditing(null);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteNguoiTruc.mutate(
      { type: confirmDelete.type, id: confirmDelete.person.idNguoitruc },
      {
        onSuccess: () => {
          toast.success("Đã xóa thành công");
          setConfirmDelete(null);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const filteredChiHuy = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chiHuyList;
    return chiHuyList.filter((p) => p.tenNguoitruc.toLowerCase().includes(q));
  }, [chiHuyList, search]);

  const filteredTacChien = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tacChienList;
    return tacChienList.filter((p) => p.tenNguoitruc.toLowerCase().includes(q));
  }, [tacChienList, search]);

  const isLoading = loadingChiHuy || loadingTacChien;

  const renderSkeletonCard = (i: number) => (
    <div
      key={`sk-${i}`}
      className="mb-2 flex items-center rounded-lg border p-3"
    >
      <Skeleton className="mr-3 size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-1.5 h-4 w-40" />
        <Skeleton className="mb-1.5 h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );

  const renderSkeletonList = (title: string) => (
    <div className="w-full px-2 lg:w-1/2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <UsersRound className="mr-2 size-5 text-primary-text" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.from({ length: 4 }).map((_, i) => renderSkeletonCard(i))}
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonCard = (person: NguoiTrucWithCaTruc, type: DutyType) => (
    <div
      key={person.idNguoitruc}
      className="mb-2 flex items-center rounded-lg border p-3"
    >
      <div className="mr-3 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary-text">
        {getInitials(person.tenNguoitruc)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="text-muted-foreground">
            {person.capbacNguoitruc}{" "}
          </span>
          <span className="font-semibold">{person.tenNguoitruc}</span>
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {person.chucvuNguoitruc}
        </p>
        {person.sodienthoai && (
          <p className="mt-0.5 flex items-center text-sm text-muted-foreground">
            <Phone className="mr-1 size-3.5" />
            {person.sodienthoai}
          </p>
        )}
      </div>
      <div className="ml-2 flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-1"
          onClick={() => startEdit(person, type)}
        >
          <SquarePen className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => setConfirmDelete({ person, type })}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );

  const renderList = (
    title: string,
    list: NguoiTrucWithCaTruc[],
    type: DutyType,
  ) => (
    <div className="w-full px-2 lg:w-1/2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <UsersRound className="mr-2 size-5 text-primary-text" />
            {title}
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
              {list.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {search ? "Không tìm thấy người trực" : "Chưa có người trực"}
            </p>
          ) : (
            list.map((p) => renderPersonCard(p, type))
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý ca trực</h1>
        <span className="mb-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          {filteredChiHuy.length + filteredTacChien.length} người trực
        </span>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Thêm người trực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex">
            <Button
              type="button"
              variant={dutyType === "chiHuy" ? "default" : "outline"}
              className="mr-2"
              onClick={() => handleDutyTypeChange("chiHuy")}
            >
              Trực chỉ huy
            </Button>
            <Button
              type="button"
              variant={dutyType === "tacChien" ? "default" : "outline"}
              onClick={() => handleDutyTypeChange("tacChien")}
            >
              Trực ban tác chiến
            </Button>
          </div>

          <div className="-mx-2 flex flex-wrap">
            <div className="mb-3 w-full px-2 sm:w-1/2 lg:w-1/4">
              <label className="mb-1 block text-sm font-medium">
                Họ và tên <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.tenNguoitruc}
                onChange={(e) => {
                  setForm((f) => ({ ...f, tenNguoitruc: e.target.value }));
                  setFormErrors((p) => ({ ...p, tenNguoitruc: undefined }));
                }}
                placeholder="Nhập họ và tên..."
              />
              {formErrors.tenNguoitruc && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors.tenNguoitruc}
                </p>
              )}
            </div>

            <div className="mb-3 w-full px-2 sm:w-1/2 lg:w-1/4">
              <label className="mb-1 block text-sm font-medium">
                Cấp bậc <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.capbacNguoitruc}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, capbacNguoitruc: v }));
                  setFormErrors((p) => ({ ...p, capbacNguoitruc: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn cấp bậc --" />
                </SelectTrigger>
                <SelectContent>
                  {capBacOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.capbacNguoitruc && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors.capbacNguoitruc}
                </p>
              )}
            </div>

            <div className="mb-3 w-full px-2 sm:w-1/2 lg:w-1/4">
              <label className="mb-1 block text-sm font-medium">
                Chức vụ <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.chucvuNguoitruc}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, chucvuNguoitruc: v }));
                  setFormErrors((p) => ({ ...p, chucvuNguoitruc: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn chức vụ --" />
                </SelectTrigger>
                <SelectContent>
                  {chucVuOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.chucvuNguoitruc && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors.chucvuNguoitruc}
                </p>
              )}
            </div>

            <div className="mb-3 w-full px-2 sm:w-1/2 lg:w-1/4">
              <label className="mb-1 block text-sm font-medium">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={form.sodienthoai}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sodienthoai: e.target.value.replace(/[^\d+\-\s]/g, ""),
                  }))
                }
                placeholder="Nhập số điện thoại..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={createNguoiTruc.isPending}>
              <Plus className="mr-2 size-4" />
              {createNguoiTruc.isPending ? "Đang thêm..." : "Thêm người trực"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên người trực..."
          className="w-full sm:w-96"
        />
      </div>

      {isLoading ? (
        <div className="-mx-2 flex flex-wrap">
          {renderSkeletonList("Trực chỉ huy")}
          {renderSkeletonList("Trực ban tác chiến")}
        </div>
      ) : (
        <div className="-mx-2 flex flex-wrap">
          {renderList("Trực chỉ huy", filteredChiHuy, "chiHuy")}
          {renderList("Trực ban tác chiến", filteredTacChien, "tacChien")}
        </div>
      )}

      {/* dialog sửa */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa người trực
              {editing ? ` — ${editing.person.tenNguoitruc}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium">
                Họ và tên <span className="text-destructive">*</span>
              </label>
              <Input
                value={editForm.tenNguoitruc}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, tenNguoitruc: e.target.value }));
                  setEditErrors((p) => ({ ...p, tenNguoitruc: undefined }));
                }}
              />
              {editErrors.tenNguoitruc && (
                <p className="mt-1 text-sm text-destructive">
                  {editErrors.tenNguoitruc}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium">
                Cấp bậc <span className="text-destructive">*</span>
              </label>
              <Select
                value={editForm.capbacNguoitruc}
                onValueChange={(v) => {
                  setEditForm((f) => ({ ...f, capbacNguoitruc: v }));
                  setEditErrors((p) => ({ ...p, capbacNguoitruc: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn cấp bậc --" />
                </SelectTrigger>
                <SelectContent>
                  {editCapBac.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.capbacNguoitruc && (
                <p className="mt-1 text-sm text-destructive">
                  {editErrors.capbacNguoitruc}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium">
                Chức vụ <span className="text-destructive">*</span>
              </label>
              <Select
                value={editForm.chucvuNguoitruc}
                onValueChange={(v) => {
                  setEditForm((f) => ({ ...f, chucvuNguoitruc: v }));
                  setEditErrors((p) => ({ ...p, chucvuNguoitruc: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn chức vụ --" />
                </SelectTrigger>
                <SelectContent>
                  {editChucVu.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.chucvuNguoitruc && (
                <p className="mt-1 text-sm text-destructive">
                  {editErrors.chucvuNguoitruc}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={editForm.sodienthoai}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    sodienthoai: e.target.value.replace(/[^\d+\-\s]/g, ""),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateNguoiTruc.isPending}
            >
              {updateNguoiTruc.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Xác nhận xóa"
        description={
          confirmDelete
            ? `Bạn có chắc muốn xóa "${confirmDelete.person.capbacNguoitruc} ${confirmDelete.person.tenNguoitruc}" khỏi danh sách?`
            : ""
        }
        confirmText="Xóa"
        loading={deleteNguoiTruc.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
