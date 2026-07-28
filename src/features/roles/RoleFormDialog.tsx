import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errorHandler";
import { CHUC_NANG_OPTIONS } from "@/config/navigation";
import { useCreateRole, useUpdateRole } from "./queries";
import type { Role } from "@/types/account";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingRole: Role | null;
  onSaved?: () => void;
};

export default function RoleFormDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
        {props.open && (
          <DialogInner key={props.editingRole?.idVaiTro ?? "new"} {...props} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DialogInner({ onOpenChange, editingRole, onSaved }: Props) {
  const editingId = editingRole?.idVaiTro ?? null;
  const [tenVaiTro, setTenVaiTro] = useState(editingRole?.tenVaiTro ?? "");
  const [chucNangList, setChucNangList] = useState<string[]>(
    editingRole?.tenChucnang ?? [],
  );
  const [saving, setSaving] = useState(false);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const toggleChucNang = (value: string) =>
    setChucNangList((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );

  const handleSubmit = async () => {
    if (!tenVaiTro.trim()) return toast.error("Vui lòng nhập tên vai trò");

    setSaving(true);
    try {
      const body = { tenVaiTro: tenVaiTro.trim(), tenChucnang: chucNangList };
      if (editingId) {
        await updateRole.mutateAsync({ id: editingId, body });
        toast.success("Cập nhật vai trò thành công");
      } else {
        await createRole.mutateAsync(body);
        toast.success("Tạo vai trò thành công");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editingId ? "Sửa vai trò" : "Thêm vai trò"}</DialogTitle>
      </DialogHeader>

      <div>
        <div className="mb-3 px-2">
          <label className="mb-1 block text-sm font-medium">
            Tên vai trò *
          </label>
          <Input
            value={tenVaiTro}
            onChange={(e) => setTenVaiTro(e.target.value)}
            placeholder="Nhập tên vai trò"
          />
        </div>

        <div className="mb-3 px-2">
          <label className="mb-2 block text-sm font-medium">Chức năng</label>
          <div className="-mx-1 flex flex-wrap">
            {CHUC_NANG_OPTIONS.map((opt) => {
              const checked = chucNangList.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`mb-2 mx-1 flex w-[calc(50%-0.5rem)] cursor-pointer items-center rounded-md border px-3 py-2 text-sm ${
                    checked
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-input"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={checked}
                    onChange={() => toggleChucNang(opt.value)}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={saving}
        >
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo vai trò"}
        </Button>
      </DialogFooter>
    </>
  );
}
