import { useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Users,
  UserCheck,
  UserRound,
  UserCog,
  UsersRound,
  X,
  Send,
  PenLine,
  ImagePlus,
  CheckCircle2,
  User,
  Award,
  Briefcase,
  Layers,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import SearchBar from "@/components/common/SearchBar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DateInputVi } from "@/components/ui/date-input-vi";
import { getErrorMessage } from "@/lib/errorHandler";
import { useAuthInfo } from "@/features/auth/queries";
import {
  useChildrenReportsMerged,
  useSubmitReport,
  useUpdateReport,
  useApproveReport,
  useRefuseReport,
  useReturnReport,
  useDraftReport,
  TONG_HOP_CAPS,
  useTongHopReports,
  useOwnReport,
} from "./queries";
import InlineOwnReportRow from "./components/InlineOwnReportRow";
import CaTrucCard from "./components/CaTrucCard";
import RefuseDialog from "./components/RefuseDialog";
import { reportApi } from "./api";
import {
  mapItemToRow,
  buildDisplayTotals,
  todayIso,
  formatNum,
  createEmptyReportRow,
} from "./utils";
import ReportTableHeader from "./components/ReportTableHeader";
import ReportTableRow from "./components/ReportTableRow";
import ReportTotalRow from "./components/ReportTotalRow";
import type {
  CreateReportRequest,
  ReportRow,
  TrucNguoiInfo,
} from "@/types/dailyReport";
import ReportColGroup from "./components/ReportColGroup";
import NhiemVuNgaySection from "./components/NhiemVuNgaySection";
import {
  EDITABLE,
  isDraft,
  isRefused,
  isNeedUpdate,
  STATUS_FILTERS,
  normalizeStatus,
} from "@/shared/report/status";
import { parseJson } from "@/shared/report/json";
import { useUnitHierarchy } from "@/shared/report/useUnitHierarchy";

function SignerRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="flex items-center text-muted-foreground">
        <span className="mr-1.5">{icon}</span>
        {label}
      </span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

export default function DailyReport() {
  const navigate = useNavigate();
  const { account, role } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;
  const isChiHuy = role === "Trực chỉ huy";
  const canReturnRole =
    role === "Trực chỉ huy" ||
    role === "Trực ban tác chiến" ||
    role === "Trực ban nội vụ";

  const [searchParams, setSearchParams] = useSearchParams();
  const ngay = searchParams.get("ngay") || todayIso();
  const setNgay = (value: string) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("ngay", value);
        return p;
      },
      { replace: true },
    );
  };
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"child" | "consolidated">("child");

  const [chuKySo, setChuKySo] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();
  const approveReport = useApproveReport();
  const refuseReport = useRefuseReport();
  const returnReport = useReturnReport();
  const draftReport = useDraftReport();

  const [confirmApprove, setConfirmApprove] = useState<ReportRow | null>(null);
  const [refuseTarget, setRefuseTarget] = useState<ReportRow | null>(null);
  const [returnTarget, setReturnTarget] = useState<ReportRow | null>(null);

  const { units, capByUnit, hideDraftForCommander, hasChildren } =
    useUnitHierarchy({
      maDonVi,
      isChiHuy,
      accountDonVi: account?.donVi,
    });

  const unitsReady = units.length > 0;

  const { data: items = [], isLoading } = useChildrenReportsMerged(
    maDonVi,
    ngay,
    capByUnit,
    hasChildren,
    unitsReady,
  );

  const isAggregating = TONG_HOP_CAPS.includes(capByUnit[maDonVi ?? ""] ?? "");

  const { data: tongHopItems = [], isLoading: tongHopLoading } =
    useTongHopReports(maDonVi, ngay, hasChildren);

  const tongHopRows = useMemo(
    () => tongHopItems.map(mapItemToRow),
    [tongHopItems],
  );

  const visibleTongHopRows = useMemo(
    () =>
      hideDraftForCommander
        ? tongHopRows.filter((r) => !r.notSubmitted && !isDraft(r.status))
        : tongHopRows,
    [tongHopRows, hideDraftForCommander],
  );

  const { data: ownDonViItem } = useOwnReport(maDonVi, ngay, false);
  const ownDonViRow = useMemo(
    () => (ownDonViItem ? mapItemToRow(ownDonViItem) : null),
    [ownDonViItem],
  );

  const rows = useMemo(() => {
    const reportByUnit = new Map(
      items.map((it) => {
        const row = mapItemToRow(it);
        return [row.donVi, row] as const;
      }),
    );

    const childUnits = maDonVi
      ? units.filter((u) => {
          if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
          const suffix = u.maDonVi.slice(maDonVi.length + 1);
          return !suffix.includes(".");
        })
      : [];

    if (childUnits.length === 0) {
      return Array.from(reportByUnit.values());
    }

    return childUnits.map(
      (u) =>
        reportByUnit.get(u.maDonVi) ??
        createEmptyReportRow({
          maDonVi: u.maDonVi,
          tenDonVi: u.tenDonvi,
          kyhieuDonVi: u.kyhieuDonvi,
          quanSoTong: u.quanSoTong,
        }),
    );
  }, [items, units, maDonVi]);

  const ownDraft = useMemo(
    () => rows.find((r) => r.donVi === maDonVi && isDraft(r.status)) ?? null,
    [rows, maDonVi],
  );

  const ownReport = useMemo(
    () => rows.find((r) => r.donVi === maDonVi && !r.notSubmitted) ?? null,
    [rows, maDonVi],
  );

  const childRows = useMemo(
    () => (hasChildren ? rows.filter((r) => r.donVi !== maDonVi) : []),
    [hasChildren, rows, maDonVi],
  );

  const approvedChildRows = useMemo(
    () =>
      childRows.filter(
        (r) => !r.notSubmitted && normalizeStatus(r.status) === "Đã_Duyệt",
      ),
    [childRows],
  );

  const totalRequiredCount = childRows.length;

  const tongHopDone = useMemo(
    () => tongHopRows.some((r) => r.donVi === maDonVi && !r.notSubmitted),
    [tongHopRows, maDonVi],
  );

  const canConsolidate =
    hasChildren &&
    !tongHopDone &&
    totalRequiredCount > 0 &&
    approvedChildRows.length === totalRequiredCount;

  const handleConsolidate = () => {
    if (!canConsolidate) return;
    navigate(`/daily-report/create?ngay=${ngay}&tongHop=1`);
  };

  const consolidateLabel = tongHopDone
    ? "Đã tổng hợp"
    : `Tổng hợp (${approvedChildRows.length}/${totalRequiredCount})`;

  const visibleRows = useMemo(
    () => rows.filter((r) => !isDraft(r.status) || r.donVi === maDonVi),
    [rows, maDonVi],
  );

  const hasFilter = search.trim() !== "" || filterStatus !== "ALL";

  const clearFilter = () => {
    setSearch("");
    setFilterStatus("ALL");
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleRows.filter((r) => {
      if (q) {
        const hit =
          r.tenDonVi.toLowerCase().includes(q) ||
          (r.kyhieuDonVi ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterStatus !== "ALL") {
        if (filterStatus === "Chua_Nop") {
          if (!r.notSubmitted) return false;
        } else {
          if (r.notSubmitted) return false;
          if (normalizeStatus(r.status) !== filterStatus) return false;
        }
      }
      return true;
    });
  }, [visibleRows, search, filterStatus]);

  const totals = useMemo(
    () => buildDisplayTotals(filteredRows),
    [filteredRows],
  );

  const absentList = useMemo(
    () =>
      filteredRows
        .filter((r) => !r.notSubmitted)
        .flatMap((r) =>
          r.chiTietVangList.map((qn) => ({
            ...qn,
            tenDonVi: r.kyhieuDonVi || r.tenDonVi,
          })),
        ),
    [filteredRows],
  );

  const tongHopTotals = useMemo(
    () => buildDisplayTotals(visibleTongHopRows),
    [visibleTongHopRows],
  );

  const tongHopAbsent = useMemo(
    () =>
      visibleTongHopRows
        .filter((r) => !r.notSubmitted)
        .flatMap((r) =>
          r.chiTietVangList.map((qn) => ({
            ...qn,
            tenDonVi: r.kyhieuDonVi || r.tenDonVi,
          })),
        ),
    [visibleTongHopRows],
  );

  const tongHopDraft = useMemo(
    () =>
      tongHopRows.find((r) => r.donVi === maDonVi && isDraft(r.status)) ?? null,
    [tongHopRows, maDonVi],
  );

  const tongHopRefused = useMemo(
    () =>
      tongHopRows.find(
        (r) => r.donVi === maDonVi && !r.notSubmitted && isRefused(r.status),
      ) ?? null,
    [tongHopRows, maDonVi],
  );

  const tongHopNeedUpdate = useMemo(
    () =>
      tongHopRows.find(
        (r) => r.donVi === maDonVi && !r.notSubmitted && isNeedUpdate(r.status),
      ) ?? null,
    [tongHopRows, maDonVi],
  );

  const handleReconsolidate = () => {
    if (!tongHopNeedUpdate) return;
    navigate(
      `/daily-report/edit/${tongHopNeedUpdate.idDonBaoCao}?ngay=${ngay}&tongHop=1`,
    );
  };

  const activeDraft = hasChildren ? tongHopDraft : ownDraft;

  const commanderReport = useMemo(
    () =>
      tongHopRows.find((r) => r.donVi === maDonVi && !r.notSubmitted) ?? null,
    [tongHopRows, maDonVi],
  );

  const canApprove =
    isChiHuy &&
    !!commanderReport &&
    normalizeStatus(commanderReport.status) === "Chờ_Duyệt";

const effectiveTab = activeTab;

  const signerSource = activeDraft ?? (canApprove ? commanderReport : null);
  const signer = useMemo(
    () =>
      parseJson<TrucNguoiInfo | null>(signerSource?.raw?.trucBanChiHuy, null),
    [signerSource],
  );

  const handlePickSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (PNG/JPG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh chữ ký tối đa 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setChuKySo(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearSignature = () => setChuKySo("");

  const doSubmit = async () => {
    if (!activeDraft) return;
    try {
      const detail = (await reportApi.getById(activeDraft.idDonBaoCao)).Result;
      const payload: CreateReportRequest = {
        quanSoTong: detail.quanSoTong,
        quanSoHienDien: detail.quanSoHienDien,
        quanSoVang: detail.quanSoVang,
        thoiGianBaoCao: detail.thoiGianBaoCao,
        thongTinVang: detail.thongTinVang,
        chiTietVang: detail.chiTietVang,
        donVi: detail.donVi.maDonVi,
        trucBanChiHuy: detail.trucBanChiHuy,
        trucBanTacChien: detail.trucBanTacChien,
        tinhHinhHoatDong: detail.tinhHinhHoatDong,
        loaiDonBaoCao: detail.loaiDonBaoCao,
        chuKySo,
      };
      await updateReport.mutateAsync({
        id: activeDraft.idDonBaoCao,
        data: payload,
      });
      await submitReport.mutateAsync(activeDraft.idDonBaoCao);
      toast.success("Đã trình báo cáo lên cấp trên phê duyệt.");
      setChuKySo("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onClickSubmit = () => {
    if (!chuKySo) {
      toast.error("Vui lòng ký số trước khi trình phê duyệt.");
      return;
    }
    setConfirmSubmit(true);
  };

  const onClickApprove = (row: ReportRow) => {
    if (!chuKySo) {
      toast.error("Vui lòng ký số trước khi phê duyệt.");
      return;
    }
    setConfirmApprove(row);
  };

  const doApprove = async () => {
    const row = confirmApprove;
    if (!row) return;
    try {
      const detail = (await reportApi.getById(row.idDonBaoCao)).Result;
      const payload: CreateReportRequest = {
        quanSoTong: detail.quanSoTong,
        quanSoHienDien: detail.quanSoHienDien,
        quanSoVang: detail.quanSoVang,
        thoiGianBaoCao: detail.thoiGianBaoCao,
        thongTinVang: detail.thongTinVang,
        chiTietVang: detail.chiTietVang,
        donVi: detail.donVi.maDonVi,
        trucBanChiHuy: detail.trucBanChiHuy,
        trucBanTacChien: detail.trucBanTacChien,
        tinhHinhHoatDong: detail.tinhHinhHoatDong,
        loaiDonBaoCao: detail.loaiDonBaoCao,
        chuKySo,
      };
      await updateReport.mutateAsync({ id: row.idDonBaoCao, data: payload });
      await approveReport.mutateAsync(row.idDonBaoCao);
      toast.success("Đã phê duyệt báo cáo tổng hợp.");
      setChuKySo("");
      setConfirmApprove(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const doRefuse = async (lyDo: string) => {
    const row = refuseTarget;
    if (!row) return;
    try {
      await refuseReport.mutateAsync({ id: row.idDonBaoCao, ghiChu: lyDo });
      toast.success("Đã từ chối báo cáo.");
      setRefuseTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const doReturn = async (lyDo: string) => {
    const row = returnTarget;
    if (!row) return;
    try {
      if (row.raw?.loaiDonBaoCao === "DON_VI") {
        await draftReport.mutateAsync({
          maDonVi: row.donVi,
          lyDo,
          ngayLoc: ngay,
        });
      } else {
        await returnReport.mutateAsync({
          idDonBaoCao: row.idDonBaoCao,
          ghiChu: lyDo,
        });
      }
      toast.success("Đã trả về báo cáo.");
      setReturnTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const returning = returnReport.isPending || draftReport.isPending;

  const approving = updateReport.isPending || approveReport.isPending;

  const submitting = updateReport.isPending || submitReport.isPending;

  const stats: {
    tone: StatCardTone;
    icon: ReactNode;
    title: string;
    value: string;
  }[] = [
    {
      tone: "emerald",
      icon: <Users />,
      title: "Tổng quân số",
      value: formatNum(totals.quanSoTong),
    },
    {
      tone: "blue",
      icon: <UserCheck />,
      title: "Hiện diện",
      value: formatNum(totals.quanSoHienDien),
    },
    {
      tone: "amber",
      icon: <UserRound />,
      title: "Vắng (SQ)",
      value: formatNum(totals.vangSQ),
    },
    {
      tone: "rose",
      icon: <UserCog />,
      title: "Vắng (QNCN)",
      value: formatNum(totals.vangQNCN),
    },
    {
      tone: "violet",
      icon: <UsersRound />,
      title: "Vắng (HSQ-BS)",
      value: formatNum(totals.vangHSQBS),
    },
  ];

  const goDetail = (row: ReportRow) =>
    navigate(`/daily-report/detail/${row.idDonBaoCao}?ngay=${ngay}`);

  const goEditOrCreate = (row: ReportRow) => {
    if (row.idDonBaoCao) {
      navigate(`/daily-report/edit/${row.idDonBaoCao}?ngay=${ngay}`);
    } else {
      navigate(`/daily-report/create?ngay=${ngay}`);
    }
  };

  const TONG_HOP_KYHIEU: Record<string, string> = {
    GS003: "f5",
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <h1 className="mb-2 mr-2 text-xl font-semibold">
          Thống kê quân số trong ngày
        </h1>
        <div className="flex items-center">
          <DateInputVi
            value={ngay}
            max={todayIso()}
            onChange={setNgay}
            className="mr-2 w-[280px]"
          />
          {hasChildren ? (
            isChiHuy ? (
              canApprove && commanderReport ? (
                <>
                  <Button
                    onClick={() => onClickApprove(commanderReport)}
                    disabled={!chuKySo || approving}
                  >
                    <CheckCircle2 className="mr-2 size-4" /> Phê duyệt
                  </Button>
                  <Button
                    variant="destructive"
                    className="ml-2"
                    onClick={() => setRefuseTarget(commanderReport)}
                    disabled={refuseReport.isPending}
                  >
                    <XCircle className="mr-2 size-4" /> Từ chối
                  </Button>
                </>
              ) : null
            ) : tongHopRefused ? (
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/daily-report/edit/${tongHopRefused.idDonBaoCao}`)
                }
              >
                <PenLine className="mr-2 size-4" /> Chỉnh sửa báo cáo
              </Button>
            ) : tongHopDraft ? (
              <Button
                onClick={() => setConfirmSubmit(true)}
                disabled={submitting}
              >
                <Send className="mr-2 size-4" /> Trình phê duyệt
              </Button>
            ) : tongHopNeedUpdate ? (
              <Button
                className="bg-amber-500 text-white hover:bg-amber-600"
                onClick={handleReconsolidate}
              >
                <Layers className="mr-2 size-4" /> Tổng hợp lại
              </Button>
            ) : tongHopDone ? (
              <span className="text-sm text-muted-foreground">
                Đã có báo cáo cho ngày này
              </span>
            ) : (
              <Button onClick={handleConsolidate} disabled={!canConsolidate}>
                <Layers className="mr-2 size-4" /> {consolidateLabel}
              </Button>
            )
          ) : ownDraft ? (
            <Button onClick={onClickSubmit} disabled={!chuKySo || submitting}>
              <Send className="mr-2 size-4" /> Trình phê duyệt
            </Button>
          ) : ownReport ? (
            <span className="text-sm text-muted-foreground">
              Đã có báo cáo cho ngày này
            </span>
          ) : (
            <Button onClick={() => navigate("/daily-report/create")}>
              <Plus className="mr-2 size-4" /> Thêm báo cáo
            </Button>
          )}
        </div>
      </div>
      <div className="-mx-1.5 mb-4 flex flex-wrap">
        {stats.map((s) => (
          <div key={s.title} className="w-full p-1.5 sm:w-1/2 lg:w-1/5">
            <StatCard
              tone={s.tone}
              icon={s.icon}
              title={s.title}
              value={s.value}
              className="h-full"
            />
          </div>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên / ký hiệu đơn vị..."
          className="mb-2 mr-3 w-full sm:w-96"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="mb-2 mr-3 w-56">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {STATUS_FILTERS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="outline" className="mb-2" onClick={clearFilter}>
            <X className="mr-2 size-4" /> Xóa lọc
          </Button>
        )}
      </div>
      {hasChildren &&  (
        <div className="mb-3 inline-flex items-center rounded-[10px] border bg-primary/10 p-1 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "child"}
            onClick={() => setActiveTab("child")}
            className={`mr-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "child"
                ? "bg-background text-primary shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200"
                : "text-muted-foreground hover:text-foreground dark:text-emerald-400/70 dark:hover:text-emerald-200"
            }`}
          >
            Báo cáo đơn vị
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "consolidated"}
            onClick={() => setActiveTab("consolidated")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "consolidated"
                ? "bg-background text-primary shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200"
                : "text-muted-foreground hover:text-foreground dark:text-emerald-400/70 dark:hover:text-emerald-200"
            }`}
          >
            Báo cáo tổng hợp
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table className="w-full table-fixed min-w-[960px]">
          <ReportColGroup />
          <ReportTableHeader />
          <TableBody>
            {effectiveTab === "consolidated" ? (
              tongHopLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={`sk-th-${i}`}>
                    {Array.from({ length: 22 }).map((__, j) => (
                      <TableCell key={`sk-th-${i}-${j}`} className="px-1">
                        <Skeleton className="mx-auto h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : visibleTongHopRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={22}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Chưa có báo cáo tổng hợp cho ngày này
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {visibleTongHopRows.map((r) => {
                    const isCommandBlock =
                      r.kyhieuDonVi === "CH/f" || r.kyhieuDonVi === "CH/e";
                    return (
                      <ReportTableRow
                        key={r.idDonBaoCao}
                        row={r}
                        canEdit={false}
                        displayKyHieu={
                          isCommandBlock && maDonVi
                            ? (TONG_HOP_KYHIEU[maDonVi] ?? r.kyhieuDonVi)
                            : undefined
                        }
                        noKySo={isCommandBlock}
                        onViewDetail={goDetail}
                        onEdit={goEditOrCreate}
                      />
                    );
                  })}
                  <ReportTotalRow
                    t={tongHopTotals}
                    absentList={tongHopAbsent}
                  />
                </>
              )
            ) : isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: 22 }).map((__, j) => (
                    <TableCell key={`sk-${i}-${j}`} className="px-1">
                      <Skeleton className="mx-auto h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={22}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasFilter
                    ? "Không tìm thấy báo cáo phù hợp"
                    : "Chưa có đơn vị nào"}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {hasChildren &&
                  !isChiHuy &&
                  maDonVi &&
                  (capByUnit[maDonVi] === "SU_DOAN" ||
                    capByUnit[maDonVi] === "TRUNG_DOAN") && (
                    <InlineOwnReportRow
                      maDonVi={maDonVi}
                      label={capByUnit[maDonVi] === "SU_DOAN" ? "CH/f" : "CH/e"}
                      ngay={ngay}
                      existing={ownDonViRow}
                      bienCheTong={
                        units.find((u) => u.maDonVi === maDonVi)?.quanSoTong ??
                        0
                      }
                    />
                  )}
                {filteredRows.map((r) => (
                  <ReportTableRow
                    key={r.idDonBaoCao}
                    row={r}
                    canEdit={!r.notSubmitted && EDITABLE.includes(r.status)}
                    canReturn={
                      canReturnRole &&
                      !r.notSubmitted &&
                      normalizeStatus(r.status) === "Đã_Duyệt"
                    }
                    onViewDetail={goDetail}
                    onEdit={goEditOrCreate}
                    onReturn={setReturnTarget}
                  />
                ))}
                <ReportTotalRow t={totals} absentList={absentList} />{" "}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {effectiveTab === "consolidated"
        ? tongHopRows.length > 0 && (
            <NhiemVuNgaySection rows={tongHopRows} hasChildren={false} />
          )
        : !isLoading &&
          filteredRows.length > 0 && (
            <NhiemVuNgaySection rows={filteredRows} hasChildren={hasChildren} />
          )}

      <CaTrucCard
        ngay={ngay}
        maDonVi={maDonVi}
        isAggregating={isAggregating}
        capDonVi={capByUnit[maDonVi ?? ""] ?? account?.donVi?.capDonVi}
      />

      {((activeDraft && !hasChildren) || canApprove) && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <PenLine className="mr-2 size-4 text-primary" />
              Ký số báo cáo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handlePickSignature}
            />

            <div className="-mx-2 flex flex-wrap items-stretch">
              <div className="mb-2 w-full px-2 md:w-2/3">
                {chuKySo ? (
                  <div className="flex h-full items-center justify-center rounded-lg border bg-[length:16px_16px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] p-4 dark:bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)]">
                    <img
                      src={chuKySo}
                      alt="Chữ ký"
                      className="max-h-40 object-contain"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-full min-h-[180px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/30 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <ImagePlus className="mb-2 size-8" />
                    Bấm để chọn ảnh chữ ký (PNG/JPG, tối đa 2MB)
                  </button>
                )}
              </div>

              <div className="mb-2 w-full px-2 md:w-1/3">
                <div className="flex h-full flex-col justify-between rounded-lg border bg-muted/30 p-4">
                  <div>
                    {chuKySo ? (
                      <div className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        <CheckCircle2 className="mr-1.5 size-4" />
                        Đã ký số
                      </div>
                    ) : (
                      <div className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                        <PenLine className="mr-1.5 size-4" />
                        Chưa ký số
                      </div>
                    )}
                    <p className="mb-3 text-sm text-muted-foreground">
                      Ký số vào báo cáo nháp trước khi bấm "Trình phê duyệt".
                      Ảnh chữ ký định dạng PNG/JPG.
                    </p>

                    <div className="divide-y rounded-lg border bg-background/70 text-sm">
                      <SignerRow
                        icon={<User className="size-3.5" />}
                        label="Người ký"
                        value={signer?.tenNguoitruc}
                      />
                      <SignerRow
                        icon={<Award className="size-3.5" />}
                        label="Cấp bậc"
                        value={signer?.capbacNguoitruc}
                      />
                      <SignerRow
                        icon={<Briefcase className="size-3.5" />}
                        label="Chức vụ"
                        value={signer?.chucvuNguoitruc}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col">
                    <Button
                      variant="outline"
                      className="mb-2 w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="mr-2 size-4" />
                      {chuKySo ? "Đổi ảnh chữ ký" : "Chọn ảnh chữ ký"}
                    </Button>
                    {chuKySo && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={clearSignature}
                      >
                        <X className="mr-2 size-4" /> Xóa chữ ký
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmSubmit}
        onOpenChange={setConfirmSubmit}
        title="Xác nhận trình phê duyệt"
        description="Báo cáo sẽ được gửi lên cấp trên để phê duyệt. Bạn có chắc chắn?"
        confirmText="Trình phê duyệt"
        loading={submitting}
        onConfirm={doSubmit}
      />

      <ConfirmDialog
        open={!!confirmApprove}
        onOpenChange={(v) => !v && setConfirmApprove(null)}
        title="Xác nhận phê duyệt"
        description="Báo cáo tổng hợp sẽ được phê duyệt. Bạn có chắc chắn?"
        confirmText="Phê duyệt"
        loading={approving}
        onConfirm={doApprove}
      />

      <RefuseDialog
        open={!!refuseTarget}
        onOpenChange={(v) => !v && setRefuseTarget(null)}
        loading={refuseReport.isPending}
        onConfirm={doRefuse}
      />

      <RefuseDialog
        open={!!returnTarget}
        onOpenChange={(v) => !v && setReturnTarget(null)}
        loading={returning}
        onConfirm={doReturn}
        variant="return"
      />
    </div>
  );
}
