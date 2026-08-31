import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNhiemVuNgayByReports } from "../queries";
import type { ReportRow } from "@/types/dailyReport";

type NhiemVu = {
  nhiemVuPhandoi: string;
  noiDungDotXuat: string;
  noiDungUuDiem: string;
  noiDungKhuyetDiem: string;
  noiDungCanGiaiQuyet: string;
};

type Accent = "success" | "danger" | "warning" | "neutral";

const STATUS_LABEL: Record<string, string> = {
  Nháp: "Nháp",
  Nhap: "Nháp",
  DRAFT: "Nháp",
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
  "Từ chối": "Từ chối",
};

const STATUS_TONE: Record<string, Accent> = {
  Nháp: "neutral",
  Nhap: "neutral",
  DRAFT: "neutral",
  Chờ_Duyệt: "warning",
  "Chờ duyệt": "warning",
  Đã_Duyệt: "success",
  Da_Duyet: "success",
  Tu_Choi: "danger",
  Từ_Chối: "danger",
  "Từ chối": "danger",
};

function Badge({
  tone,
  children,
}: {
  tone: Accent;
  children: React.ReactNode;
}) {
  const map = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-rose-100 text-rose-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-slate-100 text-muted-foreground",
  } as const;
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  );
}

const accentBorder: Record<Accent, string> = {
  success: "border-l-emerald-500",
  danger: "border-l-rose-500",
  warning: "border-l-amber-500",
  neutral: "border-l-slate-300",
};

function DetailItem({
  index,
  label,
  accent,
  badge,
  detail,
}: {
  index: number;
  label: string;
  accent: Accent;
  badge: React.ReactNode;
  detail?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-l-4 bg-card p-4 shadow-sm transition hover:shadow-md ${accentBorder[accent]}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold leading-snug">
          <span className="mr-2 text-muted-foreground">{index}.</span>
          {label}
        </span>
        <span className="ml-3 shrink-0">{badge}</span>
      </div>
      {detail ? (
        <p className="mt-3 whitespace-pre-line rounded-md border bg-muted/50 px-3 py-2 text-sm leading-relaxed">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function NhiemVuBody({ data }: { data: NhiemVu }) {
  const safe = data.nhiemVuPhandoi === "safe";
  const items: {
    label: string;
    accent: Accent;
    badge: React.ReactNode;
    detail?: string;
  }[] = [
    {
      label: "Nhiệm vụ các phân đội đóng quân canh phòng và các phân đội khác",
      accent: safe ? "success" : "danger",
      badge: (
        <Badge tone={safe ? "success" : "danger"}>
          {safe ? "✓ Đảm bảo an toàn" : "✕ Không đảm bảo an toàn"}
        </Badge>
      ),
    },
    {
      label: "Những việc đột xuất xảy ra",
      accent: data.noiDungDotXuat ? "warning" : "success",
      badge: (
        <Badge tone={data.noiDungDotXuat ? "warning" : "success"}>
          {data.noiDungDotXuat ? "⚠ Có phát sinh" : "✓ Không phát sinh"}
        </Badge>
      ),
      detail: data.noiDungDotXuat,
    },
    {
      label: "Ưu điểm nội vụ, vệ sinh",
      accent: data.noiDungUuDiem ? "success" : "neutral",
      badge: (
        <Badge tone={data.noiDungUuDiem ? "success" : "neutral"}>
          {data.noiDungUuDiem ? "✓ Có" : "— Không có"}
        </Badge>
      ),
      detail: data.noiDungUuDiem,
    },
    {
      label: "Khuyết điểm nội vụ, vệ sinh",
      accent: data.noiDungKhuyetDiem ? "danger" : "success",
      badge: (
        <Badge tone={data.noiDungKhuyetDiem ? "danger" : "success"}>
          {data.noiDungKhuyetDiem ? "✕ Có" : "✓ Không có"}
        </Badge>
      ),
      detail: data.noiDungKhuyetDiem,
    },
    {
      label: "Những việc cần tiếp tục giải quyết",
      accent: data.noiDungCanGiaiQuyet ? "warning" : "success",
      badge: (
        <Badge tone={data.noiDungCanGiaiQuyet ? "warning" : "success"}>
          {data.noiDungCanGiaiQuyet ? "⚠ Cần xử lý" : "✓ Không có"}
        </Badge>
      ),
      detail: data.noiDungCanGiaiQuyet,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <DetailItem
          key={item.label}
          index={i + 1}
          label={item.label}
          accent={item.accent}
          badge={item.badge}
          detail={item.detail}
        />
      ))}
    </div>
  );
}

export default function NhiemVuNgaySection({
  rows,
  hasChildren,
}: {
  rows: ReportRow[];
  hasChildren: boolean;
}) {
  const submitted = rows.filter((r) => !r.notSubmitted && r.idDonBaoCao);
  const queries = useNhiemVuNgayByReports(submitted.map((r) => r.idDonBaoCao));

  const [openKey, setOpenKey] = useState<string | null>(null);

  const getInfo = (r: ReportRow) => {
    const idx = submitted.findIndex((s) => s.idDonBaoCao === r.idDonBaoCao);
    const q = idx >= 0 ? queries[idx] : undefined;
    const data = (q?.data?.Result ?? null) as NhiemVu | null;
    return { isLoading: q?.isLoading ?? false, data };
  };

  const statusBadge = (r: ReportRow) =>
    r.notSubmitted ? (
      <Badge tone="neutral">Chưa nộp</Badge>
    ) : (
      <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>
        {STATUS_LABEL[r.status] ?? r.status}
      </Badge>
    );

  if (!hasChildren) {
    const r = rows[0];
    if (!r) return null;
    const info = getInfo(r);

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Tình hình nhiệm vụ trong ngày
          </h2>
          {statusBadge(r)}
        </div>

        {r.notSubmitted ? (
          <p className="text-sm text-muted-foreground">
            Đơn vị chưa nộp báo cáo
          </p>
        ) : info.isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : info.data ? (
          <NhiemVuBody data={info.data} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có nội dung nhiệm vụ ngày
          </p>
        )}
      </div>
    );
  }

  const openRow = rows.find((r) => (r.idDonBaoCao || r.donVi) === openKey);
  const openInfo = openRow ? getInfo(openRow) : null;

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold">Tình hình nhiệm vụ trong ngày</h2>

      <div className="-mx-1.5 flex flex-wrap">
        {rows.map((r, i) => {
          const key = r.idDonBaoCao || r.donVi || String(i);
          return (
            <div key={key} className="w-1/2 p-1.5 sm:w-1/3 lg:w-1/4">
              <button
                type="button"
                disabled={r.notSubmitted}
                onClick={() => setOpenKey(key)}
                className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-background p-3 text-center transition hover:border-slate-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="mb-2 line-clamp-2 text-sm font-semibold">
                  {r.kyhieuDonVi || r.tenDonVi}
                </span>
                {statusBadge(r)}
              </button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!openKey} onOpenChange={(v) => !v && setOpenKey(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {openRow?.kyhieuDonVi || openRow?.tenDonVi}
            </DialogTitle>
          </DialogHeader>
          {openInfo?.isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : openInfo?.data ? (
            <NhiemVuBody data={openInfo.data} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có nội dung nhiệm vụ ngày
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
