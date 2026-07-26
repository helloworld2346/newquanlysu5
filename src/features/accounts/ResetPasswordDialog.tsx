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
import { useResetPassword } from "./queries";
import type { Account } from "@/types/account";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account: Account | null;
};

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  account,
}: Props) {
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [saving, setSaving] = useState(false);
  const resetPassword = useResetPassword();

  const handleSubmit = async () => {
    if (!account) return;
    if (!matKhauMoi.trim()) return toast.error("Vui lòng nhập mật khẩu mới");

    setSaving(true);
    try {
      await resetPassword.mutateAsync({
        id: account.idTaiKhoan,
        matKhauMoi: matKhauMoi.trim(),
      });
      toast.success("Đặt lại mật khẩu thành công");
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Đặt lại mật khẩu
            {account ? ` — ${account.tenTaiKhoan}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="px-2">
          <label className="mb-1 block text-sm font-medium">
            Mật khẩu mới *
          </label>
          <Input
            type="password"
            value={matKhauMoi}
            onChange={(e) => setMatKhauMoi(e.target.value)}
            placeholder="Nhập mật khẩu mới..."
          />
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
            {saving ? "Đang lưu..." : "Đặt lại"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
