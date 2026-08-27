export interface TrucInfo {
  hoTen: string;
  capBac: string;
  chucVu: string;
  soDienThoai: string;
}

type AccentKey = "blue" | "emerald" | "rose" | "amber" | "violet" | "sky";

const ACCENT: Record<
  AccentKey,
  { header: string; label: string; value: string }
> = {
  blue: {
    header: "bg-blue-50",
    label: "text-blue-700",
    value: "text-blue-900",
  },
  emerald: {
    header: "bg-emerald-50",
    label: "text-emerald-700",
    value: "text-emerald-900",
  },
  rose: {
    header: "bg-rose-50",
    label: "text-rose-700",
    value: "text-rose-900",
  },
  amber: {
    header: "bg-amber-50",
    label: "text-amber-700",
    value: "text-amber-900",
  },
  violet: {
    header: "bg-violet-50",
    label: "text-violet-700",
    value: "text-violet-900",
  },
  sky: { header: "bg-sky-50", label: "text-sky-700", value: "text-sky-900" },
};

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-sm font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

export default function TrucInfoCard({
  label,
  data,
  accent = "blue",
  fullWidth,
}: {
  label: string;
  data: TrucInfo | null;
  accent?: AccentKey;
  fullWidth?: boolean;
}) {
  const tone = ACCENT[accent] ?? ACCENT.blue;
  const hasInfo =
    !!data && (data.hoTen || data.capBac || data.chucVu || data.soDienThoai);

  return (
    <div className={`w-full px-2 mb-4 ${fullWidth ? "" : "lg:w-1/2"}`}>
      <div className="h-full overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className={`px-4 py-2.5 ${tone.header}`}>
          <span
            className={`text-sm font-semibold uppercase tracking-wide ${tone.label}`}
          >
            {label}
          </span>
        </div>

        {hasInfo && data ? (
          <div className="divide-y">
            <Row label="Họ và tên" value={data.hoTen} />
            <Row label="Cấp bậc" value={data.capBac} />
            <Row label="Chức vụ" value={data.chucVu} />
            <Row label="Số điện thoại" value={data.soDienThoai} />
          </div>
        ) : (
          <p className="p-4 text-sm italic text-muted-foreground">
            — Chưa có thông tin —
          </p>
        )}
      </div>
    </div>
  );
}
