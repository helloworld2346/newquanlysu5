import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  ClipboardList,
  UsersRound,
  Info,
  Users,
  UserCheck,
  UserX,
  PenLine,
  ShieldCheck,
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportDetail, useNhiemVuNgayDetail } from "./queries";
import { LY_DO_OPTIONS, formatNum } from "./utils";
import type { AbsentRow, TrucNguoiInfo } from "@/types/dailyReport";
import TrucInfoCard, { type TrucInfo } from "./components/TrucInfoCard";

const LY_DO_LABEL: Record<string, string> = Object.fromEntries(
  LY_DO_OPTIONS.map((o) => [o.value, o.label]),
);

const STATUS_LABEL: Record<string, string> = {
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
};

const STATUS_TONE: Record<string, string> = {
  Chờ_Duyệt:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  "Chờ duyệt":
    "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  Đã_Duyệt:
    "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  Da_Duyet:
    "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  Tu_Choi: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  Từ_Chối: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const toTrucInfo = (t: TrucNguoiInfo | null): TrucInfo | null =>
  t
    ? {
        hoTen: t.tenNguoitruc,
        capBac: t.capbacNguoitruc,
        chucVu: t.chucvuNguoitruc,
        soDienThoai: t.sodienthoai,
      }
    : null;

function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function InfoField({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="min-w-0 flex-1 px-2 mb-3">
      <div className={`rounded-md border p-3 ${tone}`}>
        <div className="mb-1 flex items-center">
          <Icon className="mr-1.5 size-4 opacity-70" />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <p className="text-base font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function KySoInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="flex items-center text-muted-foreground">
        <span className="mr-1.5 text-primary">{icon}</span>
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-medium">
        {value}
      </span>
    </div>
  );
}

function KySoCard({
  chuKySo,
  signer,
  donViLabel,
  thoiGian,
}: {
  chuKySo?: string;
  signer: TrucNguoiInfo | null;
  donViLabel: string;
  thoiGian: string;
}) {
  const hasSign = !!chuKySo && chuKySo.trim() !== "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <PenLine className="mr-2 size-4 text-primary" /> Ký số
        </CardTitle>
      </CardHeader>
      <CardContent className="-mx-2 flex flex-wrap">
        {/* Khung chữ ký */}
        <div className="w-full px-2 mb-4 lg:w-1/2">
          <div className="rounded-lg border bg-primary/5 p-4">
            <div className="mb-2 flex items-center text-sm font-medium text-primary">
              <ShieldCheck className="mr-1.5 size-4" />
              {hasSign ? "Đã ký số" : "Chưa ký số"}
            </div>
            <div
              className="flex h-40 items-center justify-center overflow-hidden rounded-md border bg-card bg-[length:16px_16px] bg-[linear-gradient(to_right,rgba(31,92,63,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,92,63,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(31,92,63,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(31,92,63,0.06) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            >
              {hasSign ? (
                <img
                  src={chuKySo}
                  alt="Chữ ký số"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Chưa có chữ ký
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin người ký */}
        <div className="w-full px-2 mb-4 lg:w-1/2">
          <div className="h-full rounded-lg border">
            <div className="border-b px-3 py-2 text-sm font-semibold">
              Thông tin người ký
            </div>
            <div className="divide-y">
              <KySoInfoRow
                icon={<User className="size-3.5" />}
                label="Người ký"
                value={signer?.tenNguoitruc}
              />
              <KySoInfoRow
                icon={<Award className="size-3.5" />}
                label="Cấp bậc"
                value={signer?.capbacNguoitruc}
              />
              <KySoInfoRow
                icon={<Briefcase className="size-3.5" />}
                label="Chức vụ"
                value={signer?.chucvuNguoitruc || "Người báo cáo"}
              />
              <KySoInfoRow
                icon={<Building2 className="size-3.5" />}
                label="Đơn vị"
                value={donViLabel}
              />
              <KySoInfoRow
                icon={<CalendarClock className="size-3.5" />}
                label="Thời gian ký"
                value={thoiGian}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const NHIEM_VU_TONE = {
  success: {
    icon: CheckCircle2,
    badge:
      "bg-[hsl(var(--tone-success-bg))] text-[hsl(var(--tone-success-fg))] ring-1 ring-inset ring-[hsl(var(--tone-success-border))]",
    iconColor: "text-[hsl(var(--tone-success-fg))]",
  },
  danger: {
    icon: XCircle,
    badge:
      "bg-[hsl(var(--tone-danger-bg))] text-[hsl(var(--tone-danger-fg))] ring-1 ring-inset ring-[hsl(var(--tone-danger-border))]",
    iconColor: "text-[hsl(var(--tone-danger-fg))]",
  },
  warning: {
    icon: AlertTriangle,
    badge:
      "bg-[hsl(var(--tone-warning-bg))] text-[hsl(var(--tone-warning-fg))] ring-1 ring-inset ring-[hsl(var(--tone-warning-border))]",
    iconColor: "text-[hsl(var(--tone-warning-fg))]",
  },
  neutral: {
    icon: MinusCircle,
    badge:
      "bg-[hsl(var(--tone-neutral-bg))] text-[hsl(var(--tone-neutral-fg))] ring-1 ring-inset ring-[hsl(var(--tone-neutral-border))]",
    iconColor: "text-[hsl(var(--tone-neutral-fg))]",
  },
} as const;

function NhiemVuItem({
  index,
  label,
  status,
  detail,
  accent,
  last,
}: {
  index: number;
  label: string;
  status: string;
  detail?: string;
  accent: "success" | "danger" | "warning" | "neutral";
  last?: boolean;
}) {
  const tone = NHIEM_VU_TONE[accent];
  const Icon = tone.icon;

  return (
    <div className={last ? "" : "border-b border-border"}>
      <div className="flex items-start gap-3 py-4">
        <Icon className={`mt-0.5 size-5 shrink-0 ${tone.iconColor}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              <span className="mr-1.5 text-muted-foreground">{index}.</span>
              {label}
            </p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone.badge}`}
            >
              {status}
            </span>
          </div>
          {detail && detail.trim() !== "" && (
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground">
              {detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportDetailSkeleton() {
  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Skeleton className="mr-2 size-9 rounded-md" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`info-${i}`} className="min-w-0 flex-1 px-2 mb-3">
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`truc-${i}`} className="w-full px-2 mb-4 lg:w-1/2">
              <Skeleton className="h-44 w-full rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-10 w-full rounded-md" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`row-${i}`} className="mb-2 h-8 w-full" />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`kyso-${i}`} className="w-full px-2 mb-4 lg:w-1/2">
              <Skeleton className="h-52 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ngayParam = searchParams.get("ngay") ?? "";
  const backUrl = ngayParam
    ? `/daily-report?ngay=${ngayParam}`
    : "/daily-report";

  const { data, isLoading } = useReportDetail(id);
  const { data: nhiemVu, isLoading: nhiemVuLoading } = useNhiemVuNgayDetail(id);

  const topRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const trucChiHuy = useMemo(
    () => parseJson<TrucNguoiInfo | null>(data?.trucBanChiHuy, null),
    [data?.trucBanChiHuy],
  );
  const trucTacChien = useMemo(
    () => parseJson<TrucNguoiInfo | null>(data?.trucBanTacChien, null),
    [data?.trucBanTacChien],
  );
  const absentRows = useMemo(
    () => parseJson<AbsentRow[]>(data?.chiTietVang, []),
    [data?.chiTietVang],
  );

  const totalPages = Math.max(1, Math.ceil(absentRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedAbsent = absentRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const goToPage = (updater: number | ((p: number) => number)) => {
    setPage(updater);
    topRef.current
      ?.closest(".overflow-y-auto")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <ReportDetailSkeleton />;
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

  const ngay = data.thoiGianBaoCao?.split("T")[0] ?? "";
  const unitLabel = data.donVi.kyhieuDonvi || data.donVi.tenDonvi;

  const hasDotXuat = Boolean(nhiemVu?.noiDungDotXuat?.trim());
  const hasUuDiem = Boolean(nhiemVu?.noiDungUuDiem?.trim());
  const hasKhuyetDiem = Boolean(nhiemVu?.noiDungKhuyetDiem?.trim());
  const hasCanGiaiQuyet = Boolean(nhiemVu?.noiDungCanGiaiQuyet?.trim());
  const isSafe = nhiemVu?.nhiemVuPhandoi === "safe";

  return (
    <div ref={topRef} className="space-y-4 pb-10">
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
            Chi tiết báo cáo — {unitLabel}
          </h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            STATUS_TONE[data.status] ??
            "bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300"
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
        <CardContent className="-mx-2 flex flex-wrap">
          <InfoField
            label="Đơn vị"
            value={data.donVi.tenDonvi}
            icon={Info}
            tone="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300"
          />
          <InfoField
            label="Ngày báo cáo"
            value={ngay}
            icon={ClipboardList}
            tone="bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
          />
          <InfoField
            label="Tổng quân số"
            value={formatNum(data.quanSoTong)}
            icon={Users}
            tone="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
          />
          <InfoField
            label="Hiện diện"
            value={formatNum(data.quanSoHienDien)}
            icon={UserCheck}
            tone="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
          />
          <InfoField
            label="Tổng vắng"
            value={formatNum(data.quanSoVang)}
            icon={UserX}
            tone="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
          />
          {data.ghiChu ? (
            <InfoField
              label="Ghi chú"
              value={data.ghiChu}
              icon={ClipboardList}
              tone="bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300"
            />
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
          <TrucInfoCard
            label="Trực chỉ huy"
            data={toTrucInfo(trucChiHuy)}
            accent="blue"
          />
          <TrucInfoCard
            label="Trực ban tác chiến / nội vụ"
            data={toTrucInfo(trucTacChien)}
            accent="emerald"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <UsersRound className="mr-2 size-4 text-rose-500" /> Danh sách quân
            nhân vắng ({absentRows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {absentRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có quân nhân vắng.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">STT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Cấp bậc</TableHead>
                      <TableHead>Chức vụ</TableHead>
                      <TableHead>Lý do vắng</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAbsent.map((m, i) => (
                      <TableRow key={m.id || i}>
                        <TableCell className="text-center">
                          {(safePage - 1) * pageSize + i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{m.hoTen}</TableCell>
                        <TableCell>{m.capBac || "—"}</TableCell>
                        <TableCell>{m.chucVu || "—"}</TableCell>
                        <TableCell>
                          <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-sm font-medium text-amber-700 dark:text-amber-300">
                            {LY_DO_LABEL[m.lyDoVang] || m.lyDoVang || "—"}
                          </span>
                        </TableCell>
                        <TableCell>{m.ghiChu || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between">
                <div className="mb-2 flex items-center">
                  <span className="mr-2 text-sm text-muted-foreground">
                    Hiển thị
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="ml-2 text-sm text-muted-foreground">
                    dòng
                  </span>
                </div>

                {totalPages > 1 && (
                  <div className="mb-2 rounded-lg border bg-background px-2 py-1">
                    <Pagination className="mx-0 w-auto justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            disabled={safePage <= 1}
                            onClick={() => goToPage((p) => Math.max(1, p - 1))}
                          />
                        </PaginationItem>

                        {getPageList(safePage, totalPages).map((p, i) =>
                          p === "…" ? (
                            <PaginationItem key={`e-${i}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={p}>
                              <PaginationLink
                                isActive={p === safePage}
                                onClick={() => goToPage(p)}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}

                        <PaginationItem>
                          <PaginationNext
                            disabled={safePage >= totalPages}
                            onClick={() =>
                              goToPage((p) => Math.min(totalPages, p + 1))
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <ClipboardList className="mr-2 size-4 text-violet-500" /> Tình hình
            nhiệm vụ trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nhiemVuLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : nhiemVu ? (
            <>
              <NhiemVuItem
                index={1}
                label="Nhiệm vụ các phân đội đóng quân canh phòng"
                status={isSafe ? "Đảm bảo an toàn" : "Không đảm bảo an toàn"}
                accent={isSafe ? "success" : "danger"}
              />
              <NhiemVuItem
                index={2}
                label="Tình hình đột xuất"
                status={hasDotXuat ? "Có phát sinh" : "Không phát sinh"}
                detail={nhiemVu.noiDungDotXuat}
                accent={hasDotXuat ? "warning" : "success"}
              />
              <NhiemVuItem
                index={3}
                label="Ưu điểm trong ngày"
                status={hasUuDiem ? "Có" : "Không có"}
                detail={nhiemVu.noiDungUuDiem}
                accent={hasUuDiem ? "success" : "neutral"}
              />
              <NhiemVuItem
                index={4}
                label="Khuyết điểm trong ngày"
                status={hasKhuyetDiem ? "Có" : "Không có"}
                detail={nhiemVu.noiDungKhuyetDiem}
                accent={hasKhuyetDiem ? "danger" : "success"}
              />
              <NhiemVuItem
                index={5}
                label="Nhiệm vụ cần giải quyết"
                status={hasCanGiaiQuyet ? "Cần xử lý" : "Không có"}
                detail={nhiemVu.noiDungCanGiaiQuyet}
                accent={hasCanGiaiQuyet ? "warning" : "success"}
                last
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có nội dung nhiệm vụ ngày.
            </p>
          )}
        </CardContent>
      </Card>

      <KySoCard
        chuKySo={data.chuKySo}
        signer={trucChiHuy}
        donViLabel={unitLabel}
        thoiGian={data.thoiGianBaoCao}
      />
    </div>
  );
}
