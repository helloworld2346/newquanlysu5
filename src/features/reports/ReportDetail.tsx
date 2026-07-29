// src/features/reports/ReportDetail.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useReportDetail, useNhiemVuNgayDetail } from "./queries";
import { LY_DO_OPTIONS, formatNum } from "./utils";
import type { AbsentRow, TrucNguoiInfo } from "@/types/dailyReport";

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
  Chờ_Duyệt: "bg-amber-100 text-amber-700",
  "Chờ duyệt": "bg-amber-100 text-amber-700",
  Đã_Duyệt: "bg-emerald-100 text-emerald-700",
  Da_Duyet: "bg-emerald-100 text-emerald-700",
  Tu_Choi: "bg-rose-100 text-rose-700",
  Từ_Chối: "bg-rose-100 text-rose-700",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
}: {
  label: string;
  data: TrucNguoiInfo | null;
  accent: string;
}) {
  return (
    <div className="w-full px-2 mb-4 lg:w-1/2">
      <div className={`h-full rounded-md border border-l-4 p-4 ${accent}`}>
        <div className="mb-3 flex items-center">
          <User className="mr-2 size-4 text-primary" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {data && data.tenNguoitruc ? (
          <div className="divide-y rounded-md border bg-background/70">
            <TrucRow label="Họ và tên" value={data.tenNguoitruc} />
            <TrucRow label="Cấp bậc" value={data.capbacNguoitruc} />
            <TrucRow label="Chức vụ" value={data.chucvuNguoitruc} />
            <TrucRow label="Số điện thoại" value={data.sodienthoai} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">— Chưa có thông tin —</p>
        )}
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
              className="flex h-40 items-center justify-center overflow-hidden rounded-md border bg-white"
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

function NhiemVuItem({
  index,
  label,
  status,
  detail,
  accent,
}: {
  index: number;
  label: string;
  status: string;
  detail?: string;
  accent: "success" | "danger" | "warning" | "neutral";
}) {
  const accentBorder = {
    success: "border-l-emerald-500 bg-emerald-50/40",
    danger: "border-l-rose-500 bg-rose-50/40",
    warning: "border-l-amber-500 bg-amber-50/40",
    neutral: "border-l-slate-300",
  }[accent];
  const badgeTone = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-rose-100 text-rose-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-slate-100 text-slate-600",
  }[accent];

  return (
    <div className={`mb-3 rounded-md border border-l-4 p-4 ${accentBorder}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {index}. {label}
        </p>
        <span
          className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-sm font-medium ${badgeTone}`}
        >
          {status}
        </span>
      </div>
      {detail && detail.trim() !== "" && (
        <div className="mt-3 whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm">
          {detail}
        </div>
      )}
    </div>
  );
}

export default function ReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
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
    return <div className="p-4 text-muted-foreground">Đang tải...</div>;
  }
  if (!data) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-muted-foreground">Không tìm thấy báo cáo.</p>
        <Button variant="outline" onClick={() => navigate("/daily-report")}>
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
            onClick={() => navigate("/daily-report")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            Chi tiết báo cáo — {unitLabel}
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
        <CardContent className="-mx-2 flex flex-wrap">
          <InfoField
            label="Đơn vị"
            value={data.donVi.tenDonvi}
            icon={Info}
            tone="bg-sky-50 text-sky-700"
          />
          <InfoField
            label="Ngày báo cáo"
            value={ngay}
            icon={ClipboardList}
            tone="bg-violet-50 text-violet-700"
          />
          <InfoField
            label="Tổng quân số"
            value={formatNum(data.quanSoTong)}
            icon={Users}
            tone="bg-blue-50 text-blue-700"
          />
          <InfoField
            label="Hiện diện"
            value={formatNum(data.quanSoHienDien)}
            icon={UserCheck}
            tone="bg-emerald-50 text-emerald-700"
          />
          <InfoField
            label="Tổng vắng"
            value={formatNum(data.quanSoVang)}
            icon={UserX}
            tone="bg-rose-50 text-rose-700"
          />
          {data.ghiChu ? (
            <InfoField
              label="Ghi chú"
              value={data.ghiChu}
              icon={ClipboardList}
              tone="bg-slate-50 text-slate-700"
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
          <TrucCard
            label="Trực chỉ huy"
            data={trucChiHuy}
            accent="border-l-blue-500"
          />
          <TrucCard
            label="Trực ban tác chiến / nội vụ"
            data={trucTacChien}
            accent="border-l-emerald-500"
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
                          <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-700">
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
                status={hasDotXuat ? "Có" : "Không"}
                detail={nhiemVu.noiDungDotXuat}
                accent={hasDotXuat ? "warning" : "neutral"}
              />
              <NhiemVuItem
                index={3}
                label="Ưu điểm trong ngày"
                status={hasUuDiem ? "Có" : "Không"}
                detail={nhiemVu.noiDungUuDiem}
                accent={hasUuDiem ? "success" : "neutral"}
              />
              <NhiemVuItem
                index={4}
                label="Khuyết điểm trong ngày"
                status={hasKhuyetDiem ? "Có" : "Không"}
                detail={nhiemVu.noiDungKhuyetDiem}
                accent={hasKhuyetDiem ? "danger" : "neutral"}
              />
              <NhiemVuItem
                index={5}
                label="Nhiệm vụ cần giải quyết"
                status={hasCanGiaiQuyet ? "Có" : "Không"}
                detail={nhiemVu.noiDungCanGiaiQuyet}
                accent={hasCanGiaiQuyet ? "warning" : "neutral"}
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
