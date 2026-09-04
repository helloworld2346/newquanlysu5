import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function RefuseDialog({
  open,
  onOpenChange,
  loading,
  onConfirm,
  variant = "refuse",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading?: boolean;
  onConfirm: (lyDo: string) => void;
  variant?: "refuse" | "return";
}) {
  const [lyDo, setLyDo] = useState("");
  const isReturn = variant === "return";
  const title = isReturn ? "Trả về báo cáo" : "Từ chối báo cáo";
  const placeholder = isReturn
    ? "Nhập lý do trả về..."
    : "Nhập lý do từ chối...";
  const actionLabel = isReturn ? "Trả về" : "Từ chối";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Textarea
          rows={4}
          placeholder={placeholder}
          value={lyDo}
          onChange={(e) => setLyDo(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant={isReturn ? "default" : "destructive"}
            disabled={loading || !lyDo.trim()}
            onClick={() => onConfirm(lyDo.trim())}
          >
            {loading ? "Đang xử lý..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
