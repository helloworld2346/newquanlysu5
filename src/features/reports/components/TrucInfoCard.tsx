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
    header: "bg-blue-50 dark:bg-blue-950/40",
    label: "text-blue-700 dark:text-blue-300",
    value: "text-blue-900 dark:text-blue-200",
  },
  emerald: {
    header: "bg-emerald-50 dark:bg-emerald-950/40",
    label: "text-emerald-700 dark:text-emerald-300 dark:text-emerald-300",
    value: "text-emerald-900 dark:text-emerald-200",
  },
  rose: {
    header: "bg-rose-50 dark:bg-rose-950/40",
    label: "text-rose-700 dark:text-rose-300 dark:text-rose-300",
    value: "text-rose-900 dark:text-rose-200",
  },
  amber: {
    header: "bg-amber-50 dark:bg-amber-950/40",
    label: "text-amber-700 dark:text-amber-300 dark:text-amber-300",
    value: "text-amber-900 dark:text-amber-200",
  },
  violet: {
    header: "bg-violet-50 dark:bg-violet-950/40",
    label: "text-violet-700 dark:text-violet-300",
    value: "text-violet-900 dark:text-violet-200",
  },
  sky: { header: "bg-sky-50 dark:bg-sky-950/40", label: "text-sky-700 dark:text-sky-300", value: "text-sky-900 dark:text-sky-200" },
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
