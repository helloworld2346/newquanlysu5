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
  Chờ_Duyệt: "tone-warning",
  "Chờ duyệt": "tone-warning",
  Đã_Duyệt: "tone-success",
  Da_Duyet: "tone-success",
  "Đã duyệt": "tone-success",
  Tu_Choi: "tone-danger",
  Từ_Chối: "tone-danger",
  "Từ chối": "tone-danger",
  Nháp: "tone-neutral",
  Nhap: "tone-neutral",
};

export function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "tone-neutral";
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
        active ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
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
  empty = "—",
}: {
  label: string;
  value: string;
  tone: string;
  empty?: string;
}) {
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="whitespace-pre-wrap break-words text-sm">
        {value || empty}
      </div>
    </div>
  );
}
