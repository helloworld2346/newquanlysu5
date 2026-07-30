import { ShieldCheck, UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaTrucByDate } from "@/features/duty/queries";
import type { NguoiTrucDetail } from "@/types/duty";

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

function CaTrucPerson({
  label,
  p,
  accent,
  icon,
}: {
  label: string;
  p?: NguoiTrucDetail | null;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`h-full rounded-lg border border-l-4 ${accent} p-4`}>
      <div className="mb-2 flex items-center text-sm font-bold uppercase tracking-wide">
        <span className="mr-2 text-primary">{icon}</span>
        {label}
      </div>
      {p ? (
        <div className="text-sm">
          <p className="font-semibold">{p.tenNguoitruc}</p>
          <p className="text-muted-foreground">
            {[p.capbacNguoitruc, p.chucvuNguoitruc].filter(Boolean).join(" · ")}
          </p>
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          Chưa có thông tin
        </p>
      )}
    </div>
  );
}

export default function CaTrucCard({ ngay }: { ngay: string }) {
  const { data: caTruc, isLoading } = useCaTrucByDate(ngay);

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
          <div className="-mx-2 flex flex-wrap items-stretch">
            <div className="w-full px-2 mb-3 lg:mb-0 lg:w-2/5">
              <div className="h-full rounded-lg border border-l-4 border-l-blue-500 p-4">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-1.5 h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <div className="w-full px-2 mb-3 lg:mb-0 lg:w-2/5">
              <div className="h-full rounded-lg border border-l-4 border-l-emerald-500 p-4">
                <Skeleton className="mb-2 h-4 w-40" />
                <Skeleton className="mb-1.5 h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <div className="w-full px-2 lg:w-1/5">
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        ) : (
          <div className="-mx-2 flex flex-wrap items-stretch">
            <div className="w-full px-2 mb-3 lg:mb-0 lg:w-2/5">
              <CaTrucPerson
                label="Trực chỉ huy"
                p={caTruc?.trucChiHuy}
                accent="border-l-blue-500"
                icon={<ShieldCheck className="size-4" />}
              />
            </div>

            <div className="w-full px-2 mb-3 lg:mb-0 lg:w-2/5">
              <CaTrucPerson
                label="Trực ban tác chiến"
                p={caTruc?.trucBanTacChien}
                accent="border-l-emerald-500"
                icon={<UserCog className="size-4" />}
              />
            </div>

            <div className="w-full px-2 lg:w-1/5">
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Mật khẩu
                </p>
                <p className="mb-2 text-xs italic text-muted-foreground">
                  Hỏi - Đáp
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {caTruc?.matkhau || "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
