const STATUS_LABEL: Record<string, string> = {
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
  "Từ chối": "Từ chối",
  Nháp: "Nháp",
  Nhap: "Nháp",
};

const STATUS_TONE: Record<string, string> = {
  Chờ_Duyệt: "bg-amber-100 text-amber-700",
  "Chờ duyệt": "bg-amber-100 text-amber-700",
  Đã_Duyệt: "bg-emerald-100 text-emerald-700",
  Da_Duyet: "bg-emerald-100 text-emerald-700",
  "Đã duyệt": "bg-emerald-100 text-emerald-700",
  Tu_Choi: "bg-rose-100 text-rose-700",
  Từ_Chối: "bg-rose-100 text-rose-700",
  "Từ chối": "bg-rose-100 text-rose-700",
  Nháp: "bg-slate-100 text-slate-700",
  Nhap: "bg-slate-100 text-slate-700",
};

export function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function FlagDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        active ? "text-rose-700" : "text-muted-foreground"
      }`}
    >
      <span
        className={`inline-block size-2 rounded-full ${
          active ? "bg-rose-500" : "bg-muted-foreground/30"
        }`}
      />
      {label}
    </span>
  );
}

export function Section({
  label,
  value,
  tone,
  labelTone,
  textTone,
  empty = "—",
}: {
  label: string;
  value: string;
  tone: string;
  labelTone: string;
  textTone: string;
  empty?: string;
}) {
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div
        className={`mb-1 text-xs font-semibold uppercase tracking-wide ${labelTone}`}
      >
        {label}
      </div>
      <div className={`whitespace-pre-wrap break-words text-sm ${textTone}`}>
        {value || empty}
      </div>
    </div>
  );
}
