import { useState } from "react";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useChangePassword } from "@/features/auth/queries";

const MIN_LEN = 8;

export default function PasswordForm() {
  const changePassword = useChangePassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const checks = [
    { label: `Ít nhất ${MIN_LEN} ký tự`, ok: newPassword.length >= MIN_LEN },
    {
      label: "Có chữ hoa và chữ thường",
      ok: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    },
    { label: "Có chữ số", ok: /\d/.test(newPassword) },
    { label: "Có ký tự đặc biệt", ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const isMatch = confirmPassword !== "" && newPassword === confirmPassword;
  const isValid =
    newPassword.length >= MIN_LEN && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return toast.warning("Vui lòng nhập mật khẩu mới");
    if (newPassword !== confirmPassword)
      return toast.warning("Mật khẩu xác nhận không khớp");
    setConfirmOpen(true);
  };

  const doChange = async () => {
    try {
      const res = await changePassword.mutateAsync(newPassword);
      if (res.success) {
        toast.success("Đổi mật khẩu thành công");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center">
        <Lock className="mr-2 size-5 text-primary" />
        <CardTitle className="text-base">Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="-mx-2 flex flex-wrap">
            <div className="w-full px-2 mb-4 sm:mb-0 sm:w-1/2">
              <label className="mb-1 block text-sm font-medium">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNew ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {newPassword !== "" && (
                <ul className="mt-2 space-y-1 text-xs">
                  {checks.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-center ${c.ok ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                      {c.ok ? (
                        <Check className="mr-1.5 size-3.5" />
                      ) : (
                        <X className="mr-1.5 size-3.5" />
                      )}
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="w-full px-2 sm:w-1/2">
              <label className="mb-1 block text-sm font-medium">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {confirmPassword !== "" && (
                <p
                  className={`mt-1 text-xs ${isMatch ? "text-emerald-600" : "text-red-500"}`}
                >
                  {isMatch ? "Mật khẩu khớp" : "Mật khẩu xác nhận không khớp"}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={changePassword.isPending || !isValid}
            >
              {changePassword.isPending ? "Đang lưu..." : "Đổi mật khẩu"}
            </Button>
          </div>
        </form>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Đổi mật khẩu"
        description="Bạn có chắc muốn đổi mật khẩu? Bạn sẽ dùng mật khẩu mới cho các lần đăng nhập sau."
        confirmText="Đổi mật khẩu"
        loading={changePassword.isPending}
        onConfirm={doChange}
      />
    </Card>
  );
}
