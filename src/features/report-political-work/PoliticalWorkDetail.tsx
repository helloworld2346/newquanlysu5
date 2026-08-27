import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  User,
  Activity,
  FileText,
  Zap,
  MessageSquare,
  Building2,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePoliticalDetail } from "./queries";

interface TrucNguoi {
  hoTen: string;
  capBac: string;
  chucVu: string;
  soDienThoai: string;
}

const EMPTY_TRUC: TrucNguoi = {
  hoTen: "",
  capBac: "",
  chucVu: "",
  soDienThoai: "",
};

function parseTruc(raw: string | undefined | null): TrucNguoi {
  if (!raw) return { ...EMPTY_TRUC };
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === "object" && "hoTen" in p) {
      return {
        hoTen: p.hoTen ?? "",
        capBac: p.capBac ?? "",
        chucVu: p.chucVu ?? "",
        soDienThoai: p.soDienThoai ?? "",
      };
    }
  } catch {
    /* dữ liệu cũ: chuỗi tên trần */
  }
  return { ...EMPTY_TRUC, hoTen: raw };
}

const STATUS_LABEL: Record<string, string> = {
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
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

function TrucRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between px-3 py-2 text-sm">
      <span className="mr-3 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

function TrucCard({
  label,
  data,
  accent,
  fullWidth,
}: {
  label: string;
  data: TrucNguoi;
  accent: string;
  fullWidth?: boolean;
}) {
  const hasInfo = data.hoTen || data.capBac || data.chucVu || data.soDienThoai;
  return (
    <div className={`w-full px-2 mb-4 ${fullWidth ? "" : "lg:w-1/2"}`}>
      <div className={`h-full rounded-md border border-l-4 p-4 ${accent}`}>
        <div className="mb-3 flex items-center">
          <User className="mr-2 size-4 text-primary" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {hasInfo ? (
          <div className="divide-y rounded-md border bg-background/70">
            <TrucRow label="Họ và tên" value={data.hoTen} />
            <TrucRow label="Cấp bậc" value={data.capBac} />
            <TrucRow label="Chức vụ" value={data.chucVu} />
            <TrucRow label="Số điện thoại" value={data.soDienThoai} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">— Chưa có thông tin —</p>
        )}
      </div>
    </div>
  );
}

function TextSection({
  icon: Icon,
  iconTone,
  title,
  content,
  empty,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconTone: string;
  title: string;
  content: string;
  empty: string;
}) {
  return (
    <div className="mb-4 rounded-md border p-4">
      <div className="mb-2 flex items-center">
        <Icon className={`mr-2 size-4 ${iconTone}`} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {content?.trim() ? content : empty}
      </p>
    </div>
  );
}

export default function PoliticalWorkDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ngayParam = searchParams.get("ngay") ?? "";
  const backUrl = ngayParam
    ? `/political-work-report?ngay=${ngayParam}`
    : "/political-work-report";

  const { data, isLoading } = usePoliticalDetail(id);

  const noiVu = useMemo(() => parseTruc(data?.trucBanNoiVu), [data]);
  const ctd = useMemo(() => parseTruc(data?.trucBanCtDangCt), [data]);
  const noiVuHasInfo = !!(
    noiVu.hoTen ||
    noiVu.capBac ||
    noiVu.chucVu ||
    noiVu.soDienThoai
  );

  if (isLoading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="mr-2 size-9 rounded-md" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-muted-foreground">Không tìm thấy báo cáo.</p>
        <Button variant="outline" onClick={() => navigate(backUrl)}>
          <ArrowLeft className="mr-2 size-4" /> Quay lại
        </Button>
      </div>
    );
  }

  const unitLabel = data.donVi.kyhieuDonvi || data.donVi.tenDonvi;

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(backUrl)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            Chi tiết báo cáo CTĐ, CTCT — {unitLabel}
          </h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            STATUS_TONE[data.status] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          {STATUS_LABEL[data.status] ?? data.status}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Info className="mr-2 size-4 text-sky-500" /> Thông tin chung
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <div className="flex items-center justify-between px-1 py-2 text-sm">
            <span className="flex items-center text-muted-foreground">
              <Building2 className="mr-1.5 size-4" /> Đơn vị
            </span>
            <span className="font-medium">{data.donVi.tenDonvi}</span>
          </div>
          {data.ghiChu ? (
            <div className="flex items-center justify-between px-1 py-2 text-sm">
              <span className="flex items-center text-muted-foreground">
                <CalendarClock className="mr-1.5 size-4" /> Ghi chú
              </span>
              <span className="font-medium">{data.ghiChu}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <User className="mr-2 size-4 text-blue-500" /> Trực ban
          </CardTitle>
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          <TrucCard
            label="Trực CTĐ, CTCT"
            data={ctd}
            accent="border-l-blue-500"
            fullWidth={!noiVuHasInfo}
          />
          {noiVuHasInfo && (
            <TrucCard
              label="Trực ban nội vụ"
              data={noiVu}
              accent="border-l-emerald-500"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <FileText className="mr-2 size-4 text-violet-500" /> Nội dung báo
            cáo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextSection
            icon={Activity}
            iconTone="text-emerald-500"
            title="Tình hình hoạt động CTĐ, CTCT trong ngày"
            content={data.tinhHinh}
            empty="—"
          />
          <TextSection
            icon={FileText}
            iconTone="text-blue-500"
            title="Kết quả"
            content={data.ketQua}
            empty="—"
          />
          <TextSection
            icon={Zap}
            iconTone="text-amber-500"
            title="Vụ việc đột xuất trong ngày"
            content={data.noiDungDotXuat}
            empty="Không có"
          />
          <TextSection
            icon={MessageSquare}
            iconTone="text-rose-500"
            title="Kiến nghị, đề xuất"
            content={data.kienNghi}
            empty="Không có"
          />
        </CardContent>
      </Card>
    </div>
  );
}
