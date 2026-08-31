import { Eye, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PoliticalWorkRow } from "@/types/politicalWork";
import { StatusPill, FlagDot, Section } from "./politicalStatus";

export default function PoliticalReportCard({
  row,
  onDetail,
  onEditOrCreate,
}: {
  row: PoliticalWorkRow;
  onDetail: (row: PoliticalWorkRow) => void;
  onEditOrCreate: (row: PoliticalWorkRow) => void;
}) {
  const r = row;
  const canEdit =
    r.notSubmitted || ["Nháp", "Từ_Chối", "Từ chối"].includes(r.status);

  return (
    <Card
      className={r.notSubmitted ? "border-rose-200 bg-rose-50/60" : undefined}
    >
      <CardHeader className="relative space-y-0 pb-3">
        <div className="absolute right-4 top-4 flex shrink-0 items-center gap-1">
          {!r.notSubmitted && (
            <Button size="sm" variant="ghost" onClick={() => onDetail(r)}>
              <Eye className="size-4" />
            </Button>
          )}
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEditOrCreate(r)}>
              <PenLine className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center px-10 text-center">
          <div
            className={`text-3xl font-bold ${r.notSubmitted ? "text-rose-700" : ""}`}
          >
            {r.kyhieuDonVi || r.tenDonVi}
          </div>
          {r.kyhieuDonVi && (
            <div className="mt-0.5 text-sm text-muted-foreground">
              {r.tenDonVi}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {r.notSubmitted ? (
              <span className="inline-block rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                Chưa nộp
              </span>
            ) : (
              <StatusPill status={r.status} />
            )}
            {!r.notSubmitted && !!r.rawItem?.chuKySo?.trim() && (
              <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Đã ký
              </span>
            )}
            <FlagDot active={!!r.noiDungDotXuat} label="Đột xuất" />
            <FlagDot active={!!r.kienNghi} label="Kiến nghị" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Section
          label="Tình hình hoạt động"
          value={r.tinhHinh}
          tone="border-emerald-200 bg-emerald-50/60"
          labelTone="text-emerald-700"
          textTone="text-emerald-900"
        />
        <Section
          label="Kết quả"
          value={r.ketQua}
          tone="border-blue-200 bg-blue-50/60"
          labelTone="text-blue-700"
          textTone="text-blue-900"
        />
        <Section
          label="Việc đột xuất"
          value={r.noiDungDotXuat}
          tone="border-amber-200 bg-amber-50"
          labelTone="text-amber-700"
          textTone="text-amber-900"
        />
        <Section
          label="Kiến nghị"
          value={r.kienNghi}
          tone="border-rose-200 bg-rose-50"
          labelTone="text-rose-700"
          textTone="text-rose-900"
        />
      </CardContent>
    </Card>
  );
}
