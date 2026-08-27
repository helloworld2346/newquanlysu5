import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  Zap,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePoliticalDetail } from "./queries";
import TrucInfoCard from "@/features/reports/components/TrucInfoCard";

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


function TextSection({
  icon: Icon,
  iconTone,
  title,
  content,
  empty,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconTone: string;
  title: string;
  content: string | undefined | null;
  empty: string;
  tone: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${tone}`}>
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconTone}`}
        >
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
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
            <User className="mr-2 size-4 text-blue-500" /> Trực ban
          </CardTitle>
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          <TrucInfoCard label="Trực CTĐ, CTCT" data={ctd} accent="violet" />
          <TrucInfoCard label="Trực ban nội vụ" data={noiVu} accent="emerald" />
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
            iconTone="bg-emerald-100 text-emerald-600"
            title="Tình hình hoạt động"
            content={data.tinhHinh}
            empty="—"
            tone="bg-emerald-50/60"
          />
          <TextSection
            icon={FileText}
            iconTone="bg-blue-100 text-blue-600"
            title="Kết quả"
            content={data.ketQua}
            empty="—"
            tone="bg-blue-50/60"
          />
          <TextSection
            icon={Zap}
            iconTone="bg-amber-100 text-amber-600"
            title="Vụ việc đột xuất trong ngày"
            content={data.noiDungDotXuat}
            empty="Không có"
            tone="bg-amber-50/60"
          />
          <TextSection
            icon={MessageSquare}
            iconTone="bg-rose-100 text-rose-600"
            title="Kiến nghị, đề xuất"
            content={data.kienNghi}
            empty="Không có"
            tone="bg-rose-50/60"
          />
        </CardContent>
      </Card>
    </div>
  );
}
