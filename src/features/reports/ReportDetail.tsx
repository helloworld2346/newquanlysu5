// src/features/reports/ReportDetail.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, ClipboardList, UsersRound } from "lucide-react";
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
import { useReportDetail } from "./queries";
import { LY_DO_OPTIONS, formatNum } from "./utils";
import type {
  AbsentRow,
  DetailStepData,
  TrucNguoiInfo,
} from "@/types/dailyReport";

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

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-2 mb-3">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function TrucCard({
  label,
  data,
}: {
  label: string;
  data: TrucNguoiInfo | null;
}) {
  return (
    <div className="w-full px-2 mb-4 lg:w-1/2">
      <div className="h-full rounded-md border p-4">
        <div className="mb-2 flex items-center">
          <User className="mr-2 size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {data && data.tenNguoitruc ? (
          <div className="space-y-1 text-sm">
            <p className="text-base font-semibold">{data.tenNguoitruc}</p>
            {data.capbacNguoitruc && (
              <p>
                <span className="text-muted-foreground">Cấp bậc: </span>
                {data.capbacNguoitruc}
              </p>
            )}
            {data.chucvuNguoitruc && (
              <p>
                <span className="text-muted-foreground">Chức vụ: </span>
                {data.chucvuNguoitruc}
              </p>
            )}
            {data.sodienthoai && (
              <p>
                <span className="text-muted-foreground">Sđt: </span>
                {data.sodienthoai}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">— Chưa có thông tin —</p>
        )}
      </div>
    </div>
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
    success: "border-l-emerald-500",
    danger: "border-l-rose-500",
    warning: "border-l-amber-500",
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
  const detail = useMemo(
    () => parseJson<DetailStepData | null>(data?.tinhHinhHoatDong, null),
    [data?.tinhHinhHoatDong],
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
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {STATUS_LABEL[data.status] ?? data.status}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="-mx-2 flex">
          <InfoField label="Đơn vị" value={data.donVi.tenDonvi} />
          <InfoField label="Ngày báo cáo" value={ngay} />
          <InfoField label="Tổng quân số" value={formatNum(data.quanSoTong)} />
          <InfoField label="Hiện diện" value={formatNum(data.quanSoHienDien)} />
          <InfoField label="Tổng vắng" value={formatNum(data.quanSoVang)} />
          {data.ghiChu ? (
            <InfoField label="Ghi chú" value={data.ghiChu} />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <User className="mr-2 size-4" /> Trực ban
          </CardTitle>
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          <TrucCard label="Trực chỉ huy" data={trucChiHuy} />
          <TrucCard label="Trực ban tác chiến / nội vụ" data={trucTacChien} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <UsersRound className="mr-2 size-4" /> Danh sách quân nhân vắng (
            {absentRows.length})
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
                    <TableRow>
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
                          {LY_DO_LABEL[m.lyDoVang] || m.lyDoVang || "—"}
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
            <ClipboardList className="mr-2 size-4" /> Tình hình nhiệm vụ trong
            ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail ? (
            <>
              <NhiemVuItem
                index={1}
                label="Nhiệm vụ các phân đội đóng quân canh phòng"
                status={
                  detail.securityStatus === "safe"
                    ? "Đảm bảo an toàn"
                    : "Không đảm bảo an toàn"
                }
                accent={detail.securityStatus === "safe" ? "success" : "danger"}
              />
              <NhiemVuItem
                index={2}
                label="Tình hình đột xuất"
                status={detail.incidentStatus === "yes" ? "Có" : "Không"}
                detail={detail.incidentDetail}
                accent={detail.incidentStatus === "yes" ? "warning" : "neutral"}
              />
              <NhiemVuItem
                index={3}
                label="Ưu điểm trong ngày"
                status={detail.advantageStatus === "yes" ? "Có" : "Không"}
                detail={detail.advantageDetail}
                accent={
                  detail.advantageStatus === "yes" ? "success" : "neutral"
                }
              />
              <NhiemVuItem
                index={4}
                label="Khuyết điểm trong ngày"
                status={detail.disadvantageStatus === "yes" ? "Có" : "Không"}
                detail={detail.disadvantageDetail}
                accent={
                  detail.disadvantageStatus === "yes" ? "danger" : "neutral"
                }
              />
              <NhiemVuItem
                index={5}
                label="Nhiệm vụ cần giải quyết"
                status={detail.pendingTaskStatus === "yes" ? "Có" : "Không"}
                detail={detail.pendingDetail}
                accent={
                  detail.pendingTaskStatus === "yes" ? "warning" : "neutral"
                }
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có nội dung nhiệm vụ ngày.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
