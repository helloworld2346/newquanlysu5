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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errorHandler";
import { useCreateAccount, useUpdateAccount } from "./queries";
import type { Account, DonVi, Role } from "@/types/account";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingAccount: Account | null;
  donViList: DonVi[];
  roleList: Role[];
  onSaved?: () => void;
};

type FormState = {
  tenTaiKhoan: string;
  tenDangNhap: string;
  matkhau: string;
  donVi: string;
  vaiTro: string;
};

function buildInitial(acc: Account | null): FormState {
  if (!acc) {
    return {
      tenTaiKhoan: "",
      tenDangNhap: "",
      matkhau: "",
      donVi: "",
      vaiTro: "",
    };
  }
  return {
    tenTaiKhoan: acc.tenTaiKhoan,
    tenDangNhap: acc.tenDangNhap,
    matkhau: "",
    donVi: acc.donVi?.maDonVi ?? "",
    vaiTro: acc.vaiTro?.idVaiTro ?? "",
  };
}

export default function AccountFormDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
        {props.open && (
          <DialogInner
            key={props.editingAccount?.idTaiKhoan ?? "new"}
            {...props}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DialogInner({
  onOpenChange,
  editingAccount,
  donViList,
  roleList,
  onSaved,
}: Props) {
  const editingId = editingAccount?.idTaiKhoan ?? null;
  const [form, setForm] = useState<FormState>(() =>
    buildInitial(editingAccount),
  );
  const [saving, setSaving] = useState(false);

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const setField = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.tenTaiKhoan.trim())
      return toast.error("Vui lòng nhập tên tài khoản");
    if (!editingId && !form.tenDangNhap.trim())
      return toast.error("Vui lòng nhập tên đăng nhập");
    if (!editingId && !form.matkhau.trim())
      return toast.error("Vui lòng nhập mật khẩu");
    if (!form.donVi) return toast.error("Vui lòng chọn đơn vị");
    if (!form.vaiTro) return toast.error("Vui lòng chọn vai trò");

    setSaving(true);
    try {
      if (editingId) {
        await updateAccount.mutateAsync({
          id: editingId,
          body: {
            tenTaiKhoan: form.tenTaiKhoan,
            donVi: form.donVi,
            vaiTro: form.vaiTro,
          },
        });
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await createAccount.mutateAsync({
          tenTaiKhoan: form.tenTaiKhoan,
          tenDangNhap: form.tenDangNhap,
          matkhau: form.matkhau,
          donVi: form.donVi,
          vaiTro: form.vaiTro,
        });
        toast.success("Tạo tài khoản thành công");
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
        <DialogTitle>
          {editingId ? "Sửa tài khoản" : "Thêm tài khoản"}
        </DialogTitle>
      </DialogHeader>

      <div>
        <Field label="Tên tài khoản *">
          <Input
            value={form.tenTaiKhoan}
            onChange={(e) => setField("tenTaiKhoan", e.target.value)}
          />
        </Field>

        {!editingId && (
          <>
            <Field label="Tên đăng nhập *">
              <Input
                value={form.tenDangNhap}
                onChange={(e) => setField("tenDangNhap", e.target.value)}
              />
            </Field>
            <Field label="Mật khẩu *">
              <Input
                type="password"
                value={form.matkhau}
                onChange={(e) => setField("matkhau", e.target.value)}
              />
            </Field>
          </>
        )}

        <Field label="Đơn vị *">
          <Select
            value={form.donVi}
            onValueChange={(v) => setField("donVi", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn đơn vị --" />
            </SelectTrigger>
            <SelectContent>
              {donViList.map((d) => (
                <SelectItem key={d.maDonVi} value={d.maDonVi}>
                  {d.tenDonvi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Vai trò *">
          <Select
            value={form.vaiTro}
            onValueChange={(v) => setField("vaiTro", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn vai trò --" />
            </SelectTrigger>
            <SelectContent>
              {roleList
                .filter((r) => r.idVaiTro)
                .map((r) => (
                  <SelectItem key={r.idVaiTro!} value={r.idVaiTro!}>
                    {r.tenVaiTro}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
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
          {saving
            ? "Đang lưu..."
            : editingId
              ? "Lưu thay đổi"
              : "Tạo tài khoản"}
        </Button>
      </DialogFooter>
    </>
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
