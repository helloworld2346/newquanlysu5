import {
  ShieldCheck,
  PenLine,
  CalendarClock,
  User,
  Award,
  Briefcase,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  chuKySo?: string | null;
  hoTen?: string;
  capBac?: string;
  chucVu?: string;
  donViLabel?: string;
  thoiGian?: string;
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="flex items-center text-muted-foreground">
        <span className="mr-1.5 text-primary">{icon}</span>
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function KySoModal({
  open,
  onOpenChange,
  chuKySo,
  hoTen,
  capBac,
  chucVu = "Người báo cáo",
  donViLabel,
  thoiGian,
}: Props) {
  const hasSign = !!chuKySo && chuKySo.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden p-0">
        <DialogHeader className="space-y-0 bg-gradient-to-r from-primary to-primary/80 px-5 py-4 text-left">
          <div className="flex items-center">
            <span className="mr-3 flex size-9 items-center justify-center rounded-full bg-card/20">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-primary-foreground">
                Thông tin ký số
              </DialogTitle>
              <p className="text-xs text-primary-foreground/80">
                Chữ ký điện tử đã được xác thực
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <PenLine className="mr-1.5 size-3.5" />
              {chucVu}
            </span>
            {hasSign && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                <ShieldCheck className="mr-1 size-3.5" />
                Đã xác thực
              </span>
            )}
          </div>

          <div
            className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-card p-4 bg-[length:16px_16px] bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] dark:border-slate-700 dark:bg-[linear-gradient(#334155_1px,transparent_1px),linear-gradient(90deg,#334155_1px,transparent_1px)]"
            style={{
              backgroundImage:
                "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {hasSign ? (
              <img
                src={chuKySo!}
                alt="Chữ ký số"
                className="max-h-[160px] max-w-full object-contain"
              />
            ) : (
              <span className="text-sm text-muted-foreground">
                Chưa có chữ ký
              </span>
            )}
          </div>

          <div className="mt-4 divide-y rounded-lg border bg-muted/30 text-sm">
            <InfoRow
              icon={<User className="size-3.5" />}
              label="Người ký"
              value={hoTen}
            />
            <InfoRow
              icon={<Award className="size-3.5" />}
              label="Cấp bậc"
              value={capBac}
            />
            <InfoRow
              icon={<Briefcase className="size-3.5" />}
              label="Chức vụ"
              value={chucVu}
            />
            <InfoRow
              icon={<Building2 className="size-3.5" />}
              label="Đơn vị"
              value={donViLabel}
            />
            <InfoRow
              icon={<CalendarClock className="size-3.5" />}
              label="Thời gian ký"
              value={thoiGian}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
