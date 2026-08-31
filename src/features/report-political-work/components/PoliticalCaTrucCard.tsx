import { ShieldCheck, UserCog, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOwnPoliticalReport } from "../queries";

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

function formatDateFull(iso: string): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(d.getTime())) return iso;
  return `${WEEKDAYS[d.getDay()]}, ${parts[2]}/${parts[1]}/${parts[0]}`;
}

interface TrucNguoi {
  hoTen: string;
  capBac: string;
  chucVu: string;
  soDienThoai: string;
}

function parseTruc(raw: string | undefined | null): TrucNguoi | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === "object" && "hoTen" in p && p.hoTen) {
      return {
        hoTen: p.hoTen ?? "",
        capBac: p.capBac ?? "",
        chucVu: p.chucVu ?? "",
        soDienThoai: p.soDienThoai ?? "",
      };
    }
  } catch {
    if (raw.trim()) {
      return { hoTen: raw, capBac: "", chucVu: "", soDienThoai: "" };
    }
  }
  return null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const last = parts[parts.length - 1]?.[0] ?? "";
  const first = parts[0]?.[0] ?? "";
  return (first + last).toUpperCase();
}

type BadgeTone = {
  headerBg: string;
  headerText: string;
  avatarBg: string;
  avatarText: string;
  ring: string;
  iconText: string;
};

const CTDCT_TONE: BadgeTone = {
  headerBg: "bg-primary/5",
  headerText: "text-primary",
  avatarBg: "bg-primary/10",
  avatarText: "text-primary",
  ring: "ring-primary/20",
  iconText: "text-primary",
};

const NOIVU_TONE: BadgeTone = {
  headerBg: "bg-gold/10",
  headerText: "text-amber-700",
  avatarBg: "bg-gold/20",
  avatarText: "text-amber-700",
  ring: "ring-gold/30",
  iconText: "text-amber-600",
};

function IdBadge({
  label,
  p,
  icon,
  tone,
}: {
  label: string;
  p: TrucNguoi | null;
  icon: React.ReactNode;
  tone: BadgeTone;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex items-center justify-center gap-2 border-b border-slate-200 ${tone.headerBg} px-4 py-3`}
      >
        <span className={tone.iconText}>{icon}</span>
        <span
          className={`text-sm font-bold uppercase tracking-wide ${tone.headerText}`}
        >
          {label}
        </span>
      </div>

      {p ? (
        <div className="flex flex-col items-center px-6 py-5">
          <div
            className={`flex size-20 items-center justify-center rounded-full ${tone.avatarBg} text-2xl font-bold ${tone.avatarText} ring-4 ${tone.ring} ring-offset-2 ring-offset-white`}
          >
            {initials(p.hoTen)}
          </div>

          <h4 className="mt-3 text-center text-lg font-bold uppercase tracking-wide text-slate-800">
            {p.hoTen}
          </h4>
          {p.chucVu && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {p.chucVu}
            </p>
          )}

          <div className="mt-4 w-full space-y-1.5 text-center text-sm">
            {p.capBac && (
              <p className="text-slate-600">
                <span className="font-medium text-slate-500">Cấp bậc: </span>
                {p.capBac}
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-slate-600">
              <Phone className={`size-3.5 ${tone.iconText}`} />
              {p.soDienThoai || "—"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 py-8">
          <div className="flex size-20 items-center justify-center rounded-full bg-slate-50 text-slate-300 ring-4 ring-slate-100 ring-offset-2 ring-offset-white">
            {icon}
          </div>
          <p className="mt-3 text-sm italic text-muted-foreground">
            Chưa có thông tin
          </p>
        </div>
      )}
    </div>
  );
}

export default function PoliticalCaTrucCard({
  ngay,
  maDonVi,
  enabled = true,
}: {
  ngay: string;
  maDonVi: string | undefined;
  enabled?: boolean;
}) {
  const { data: report, isLoading } = useOwnPoliticalReport(
    maDonVi,
    ngay,
    enabled,
  );

  const trucCtDangCt = parseTruc(report?.trucBanCtDangCt);
  const trucNoiVu = parseTruc(report?.trucBanNoiVu);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold uppercase tracking-wide text-slate-700">
            Thông tin ca trực
          </h3>
          <p className="mt-1 text-sm font-medium uppercase text-muted-foreground">
            {formatDateFull(ngay)}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-slate-200 p-6"
              >
                <Skeleton className="size-20 rounded-full" />
                <Skeleton className="mt-3 h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-28" />
                <Skeleton className="mt-4 h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <IdBadge
              label="Trực ban CTĐ, CTCT"
              p={trucCtDangCt}
              icon={<ShieldCheck className="size-8" />}
              tone={CTDCT_TONE}
            />
            <IdBadge
              label="Trực ban nội vụ"
              p={trucNoiVu}
              icon={<UserCog className="size-8" />}
              tone={NOIVU_TONE}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
