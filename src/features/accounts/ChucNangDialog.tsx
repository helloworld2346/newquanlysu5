import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/errorHandler";
import { CHUC_NANG_OPTIONS } from "@/config/navigation";
import { useUpdateChucNang } from "./queries";
import type { Account } from "@/types/account";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account: Account | null;
};

const clean = (arr?: string[] | null) =>
  (arr ?? []).filter((c) => c && c.trim() !== "");

export default function ChucNangDialog({ open, onOpenChange, account }: Props) {
  const [selected, setSelected] = useState<string[]>(() =>
    clean(account?.tenChucnang ?? account?.vaiTro?.tenChucnang),
  );
  const [saving, setSaving] = useState(false);
  const updateChucNang = useUpdateChucNang();

  const toggle = (value: string) =>
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );

  const handleSubmit = async () => {
    if (!account) return;
    const base = clean(account.vaiTro?.tenChucnang);
    const sel = clean(selected);
    const chucNangThem = sel.filter((c) => !base.includes(c));
    const chucNangBo = base.filter((c) => !sel.includes(c));

    setSaving(true);
    try {
      await updateChucNang.mutateAsync({
        id: account.idTaiKhoan,
        data: { chucNangThem, chucNangBo },
      });
      toast.success("Cập nhật chức năng thành công");
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Đổi chức năng
            {account ? ` — ${account.tenTaiKhoan}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="px-2">
          {CHUC_NANG_OPTIONS.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`mb-2 flex w-full items-center rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  checked
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-input hover:bg-accent"
                }`}
              >
                <span
                  className={`mr-3 grid size-5 shrink-0 place-items-center rounded border ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  }`}
                >
                  {checked && <Check className="size-3.5" />}
                </span>
                {opt.label}
              </button>
            );
          })}
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
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
