import { useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  FileCheck2,
  Clock,
  AlertTriangle,
  ClipboardList,
  Layers,
  Send,
  PenLine,
  CheckCircle2,
  XCircle,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
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
import { todayIso } from "@/features/reports/utils";
import {
  isDraft,
  isRefused,
  STATUS_FILTERS,
  normalizeStatus,
} from "@/shared/report/status";
import { useUnitHierarchy } from "@/shared/report/useUnitHierarchy";
// ===== Batch 1 (điều chỉnh tên nếu bạn đặt khác) =====
import {
  useChildrenPoliticalMerged,
  useTongHopPolitical,
  useOwnPolitical,
  useSubmitPolitical,
  useApprovePolitical,
  useRefusePolitical,
  POLITICAL_TONG_HOP_CAPS,
} from "./queries";
import { mapItemToPoliticalRow, createEmptyPoliticalWorkRow } from "./utils";
import type { PoliticalWorkRow } from "./types";
import RefuseDialog from "@/features/reports/components/RefuseDialog";

function StatusBadge({
  active,
  danger,
}: {
  active: boolean;
  danger?: boolean;
}) {
  const cls = !active
    ? "bg-muted text-muted-foreground"
    : danger
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {active ? "Có" : "Không"}
    </span>
  );
}

export default function PoliticalWorkReport() {
  const navigate = useNavigate();
  const { account, role } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;
  const isChiHuy = role === "Trực chỉ huy";

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

  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<PoliticalWorkRow | null>(
    null,
  );
  const [refuseTarget, setRefuseTarget] = useState<PoliticalWorkRow | null>(
    null,
  );

  const submitReport = useSubmitPolitical();
  const approveReport = useApprovePolitical();
  const refuseReport = useRefusePolitical();

  const { units, capByUnit, hideDraftForCommander, hasChildren } =
    useUnitHierarchy({ maDonVi, isChiHuy, accountDonVi: account?.donVi });

  const unitsReady = units.length > 0;

  const { data: items = [], isLoading } = useChildrenPoliticalMerged(
    maDonVi,
    ngay,
    capByUnit,
    hasChildren,
    unitsReady,
  );

  const { data: tongHopItems = [], isLoading: tongHopLoading } =
    useTongHopPolitical(maDonVi, ngay, hasChildren);

  const tongHopRows = useMemo(
    () => tongHopItems.map(mapItemToPoliticalRow),
    [tongHopItems],
  );

  const visibleTongHopRows = useMemo(
    () =>
      hideDraftForCommander
        ? tongHopRows.filter((r) => !r.notSubmitted && !isDraft(r.status))
        : tongHopRows,
    [tongHopRows, hideDraftForCommander],
  );

  const { data: ownDonViItem } = useOwnPolitical(maDonVi, ngay, false);

  const rows = useMemo(() => {
    const byUnit = new Map(
      items.map((it) => {
        const row = mapItemToPoliticalRow(it);
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

    if (childUnits.length === 0) return Array.from(byUnit.values());

    return childUnits.map(
      (u) =>
        byUnit.get(u.maDonVi) ??
        createEmptyPoliticalWorkRow({
          maDonVi: u.maDonVi,
          tenDonVi: u.tenDonvi,
          kyhieuDonVi: u.kyhieuDonvi,
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

  const consolidateLabel = tongHopDone
    ? "Đã tổng hợp"
    : `Tổng hợp (${approvedChildRows.length}/${totalRequiredCount})`;

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

  const commanderReport = useMemo(
    () =>
      tongHopRows.find((r) => r.donVi === maDonVi && !r.notSubmitted) ?? null,
    [tongHopRows, maDonVi],
  );

  const canApprove =
    isChiHuy &&
    !!commanderReport &&
    normalizeStatus(commanderReport.status) === "Chờ_Duyệt";

  const effectiveTab = isChiHuy && hasChildren ? "consolidated" : activeTab;

  const visibleRows = useMemo(
    () =>
      rows.filter((r) => {
        if (hideDraftForCommander) return !r.notSubmitted && !isDraft(r.status);
        return !isDraft(r.status) || r.donVi === maDonVi;
      }),
    [rows, maDonVi, hideDraftForCommander],
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
          (r.kyhieuDonVi ?? "").toLowerCase().includes(q) ||
          r.tinhHinh.toLowerCase().includes(q) ||
          r.ketQua.toLowerCase().includes(q);
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

  const displayRows =
    effectiveTab === "consolidated" ? visibleTongHopRows : filteredRows;

  // ==== Thống kê StatCard ====
  const totalUnits = hasChildren ? childRows.length : rows.length;
  const reported = (hasChildren ? childRows : rows).filter(
    (r) => !r.notSubmitted && normalizeStatus(r.status) === "Đã_Duyệt",
  ).length;
  const notReported = (hasChildren ? childRows : rows).filter(
    (r) => r.notSubmitted,
  ).length;
  const incidents = rows.filter((r) => !!r.noiDungDotXuat).length;
  const proposals = rows.filter((r) => !!r.kienNghi).length;

  const stats: {
    tone: StatCardTone;
    icon: ReactNode;
    title: string;
    value: string;
  }[] = [
    {
      tone: "emerald",
      icon: <FileCheck2 />,
      title: "Tổng đơn vị",
      value: String(totalUnits),
    },
    {
      tone: "blue",
      icon: <FileCheck2 />,
      title: "Đã báo cáo",
      value: String(reported),
    },
    {
      tone: "amber",
      icon: <Clock />,
      title: "Chưa báo cáo",
      value: String(notReported),
    },
    {
      tone: "rose",
      icon: <AlertTriangle />,
      title: "Việc đột xuất",
      value: String(incidents),
    },
    {
      tone: "violet",
      icon: <ClipboardList />,
      title: "Kiến nghị",
      value: String(proposals),
    },
  ];

  const goDetail = (row: PoliticalWorkRow) =>
    navigate(`/political-work-report/detail/${row.idCongtac}?ngay=${ngay}`);

  const goEditOrCreate = (row: PoliticalWorkRow) => {
    if (row.idCongtac)
      navigate(`/political-work-report/edit/${row.idCongtac}?ngay=${ngay}`);
    else navigate(`/political-work-report/create?ngay=${ngay}`);
  };

  const handleConsolidate = () => {
    if (!canConsolidate) return;
    navigate(`/political-work-report/create?ngay=${ngay}&tongHop=1`);
  };

  const doSubmit = async () => {
    const target = hasChildren ? tongHopDraft : ownDraft;
    if (!target) return;
    try {
      await submitReport.mutateAsync(target.idCongtac);
      toast.success("Đã trình báo cáo lên cấp trên phê duyệt.");
      setConfirmSubmit(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const doApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveReport.mutateAsync(confirmApprove.idCongtac);
      toast.success("Đã phê duyệt báo cáo tổng hợp.");
      setConfirmApprove(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const doRefuse = async (lyDo: string) => {
    if (!refuseTarget) return;
    try {
      await refuseReport.mutateAsync({
        id: refuseTarget.idCongtac,
        ghiChu: lyDo,
      });
      toast.success("Đã từ chối báo cáo.");
      setRefuseTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const submitting = submitReport.isPending;
  const approving = approveReport.isPending;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <h1 className="mb-2 mr-2 text-xl font-semibold">
          Hoạt động CTĐ, CTCT trong ngày
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
                    onClick={() => setConfirmApprove(commanderReport)}
                    disabled={approving}
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
                  navigate(
                    `/political-work-report/edit/${tongHopRefused.idCongtac}`,
                  )
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
            <Button
              onClick={() => setConfirmSubmit(true)}
              disabled={submitting}
            >
              <Send className="mr-2 size-4" /> Trình phê duyệt
            </Button>
          ) : ownReport ? (
            <span className="text-sm text-muted-foreground">
              Đã có báo cáo cho ngày này
            </span>
          ) : (
            <Button
              onClick={() =>
                navigate(`/political-work-report/create?ngay=${ngay}`)
              }
            >
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

      {hasChildren && !isChiHuy && (
        <div className="mb-3 inline-flex items-center rounded-[10px] border bg-primary/10 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("child")}
            className={`mr-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "child"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Báo cáo đơn vị
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("consolidated")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "consolidated"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Báo cáo tổng hợp
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table className="w-full min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Tình hình hoạt động</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Đột xuất</TableHead>
              <TableHead>Kiến nghị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(effectiveTab === "consolidated" ? tongHopLoading : isLoading) ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={`sk-${i}-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasFilter
                    ? "Không tìm thấy báo cáo phù hợp"
                    : "Chưa có báo cáo cho ngày này"}
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((r) => (
                <TableRow key={r.idCongtac || r.donVi}>
                  <TableCell className="font-medium">
                    {r.kyhieuDonVi || r.tenDonVi}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {r.tinhHinh || "—"}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {r.ketQua || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={!!r.noiDungDotXuat} danger />
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={!!r.kienNghi} danger />
                  </TableCell>
                  <TableCell>
                    {r.notSubmitted ? (
                      <span className="text-xs text-muted-foreground">
                        Chưa nộp
                      </span>
                    ) : (
                      <span className="text-xs font-medium">{r.status}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!r.notSubmitted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => goDetail(r)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    )}
                    {r.notSubmitted ||
                    ["Nháp", "Từ_Chối", "Từ chối"].includes(r.status) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => goEditOrCreate(r)}
                      >
                        <PenLine className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
