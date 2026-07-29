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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading?: boolean;
  onConfirm: (lyDo: string) => void;
}) {
  const [lyDo, setLyDo] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối báo cáo</DialogTitle>
        </DialogHeader>
        <Textarea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={lyDo}
          onChange={(e) => setLyDo(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            disabled={loading || !lyDo.trim()}
            onClick={() => onConfirm(lyDo.trim())}
          >
            {loading ? "Đang xử lý..." : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
