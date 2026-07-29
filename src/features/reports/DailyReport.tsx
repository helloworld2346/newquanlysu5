// src/features/reports/DailyReport.tsx
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Users,
  UserCheck,
  UserRound,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
import SearchBar from "@/components/common/SearchBar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DateInputVi } from "@/components/ui/date-input-vi";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import RefuseDialog from "./components/RefuseDialog";
import { getErrorMessage } from "@/lib/errorHandler";
import { useAuthInfo } from "@/features/auth/queries";
import {
  useChildrenReportsMerged,
  useSubmitReport,
  useRecallReport,
  useApproveReport,
  useRefuseReport,
} from "./queries";
import { useUnits } from "@/features/units/queries";
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
import type { ReportRow } from "@/types/dailyReport";
import ReportColGroup from "./components/ReportColGroup";
import NhiemVuNgaySection from "./components/NhiemVuNgaySection";

const EDITABLE = ["Nháp", "Tu_Choi", "Từ_Chối", "Từ chối"];

const DRAFT = ["Nháp", "Nhap", "DRAFT"];
const isDraft = (s: string) => DRAFT.includes(s);

const PENDING = ["Chờ_Duyệt", "Chờ duyệt"];
const isPending = (s: string) => PENDING.includes(s);

const STATUS_FILTERS = [
  { value: "Chua_Nop", label: "Chưa nộp" },
  { value: "Đã_Duyệt", label: "Đã duyệt" },
];

function normalizeStatus(s: string): string {
  if (["Chờ_Duyệt", "Chờ duyệt"].includes(s)) return "Chờ_Duyệt";
  if (["Đã_Duyệt", "Đã duyệt", "Da_Duyet"].includes(s)) return "Đã_Duyệt";
  return s;
}

export default function DailyReport() {
  const navigate = useNavigate();
  const { account, role } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;
  const isChiHuy = role === "Trực chỉ huy";

  const [ngay, setNgay] = useState(todayIso());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // luồng nháp / trình duyệt
  const [confirmSubmit, setConfirmSubmit] = useState<ReportRow | null>(null);
  const [confirmRecall, setConfirmRecall] = useState<ReportRow | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<ReportRow | null>(null);
  const [refuseTarget, setRefuseTarget] = useState<ReportRow | null>(null);

  const submitReport = useSubmitReport();
  const recallReport = useRecallReport();
  const approveReport = useApproveReport();
  const refuseReport = useRefuseReport();

  const { data: units = [] } = useUnits();

  const capByUnit = useMemo(
    () =>
      Object.fromEntries(units.map((u) => [u.maDonVi, u.capDonVi])) as Record<
        string,
        string | null | undefined
      >,
    [units],
  );

  const hasChildren = useMemo(() => {
    if (!maDonVi) return false;
    return units.some((u) => {
      if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
      const suffix = u.maDonVi.slice(maDonVi.length + 1);
      return !suffix.includes(".");
    });
  }, [units, maDonVi]);

  const unitsReady = units.length > 0;

  const { data: items = [], isLoading } = useChildrenReportsMerged(
    maDonVi,
    ngay,
    capByUnit,
    hasChildren,
    unitsReady,
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

  const goEditOrCreate = (row: ReportRow) => {
    if (row.notSubmitted) {
      navigate(`/daily-report/create?donVi=${row.donVi}&ngay=${ngay}`);
    } else {
      navigate(`/daily-report/edit/${row.idDonBaoCao}`);
    }
  };

  const goDetail = (row: ReportRow) => {
    if (row.notSubmitted) {
      navigate(`/daily-report/create?donVi=${row.donVi}`);
    } else {
      navigate(`/daily-report/detail/${row.idDonBaoCao}`);
    }
  };

  // ---- quyền theo từng dòng ----
  const isOwnRow = (r: ReportRow) => r.donVi === maDonVi;
  const canSubmit = (r: ReportRow) =>
    !r.notSubmitted &&
    isOwnRow(r) &&
    isDraft(r.status) &&
    !!r.raw?.chuKySo &&
    r.raw.chuKySo.trim() !== "";
  const canRecall = (r: ReportRow) =>
    !r.notSubmitted && isOwnRow(r) && isPending(r.status);
  const canApprove = (r: ReportRow) =>
    !r.notSubmitted && isChiHuy && !isOwnRow(r) && isPending(r.status);

  // ---- xử lý mutation ----
  const doSubmit = async () => {
    if (!confirmSubmit) return;
    try {
      await submitReport.mutateAsync(confirmSubmit.idDonBaoCao);
      toast.success("Đã trình phê duyệt báo cáo");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setConfirmSubmit(null);
    }
  };

  const doRecall = async () => {
    if (!confirmRecall) return;
    try {
      await recallReport.mutateAsync(confirmRecall.idDonBaoCao);
      toast.success("Đã thu hồi báo cáo về nháp");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setConfirmRecall(null);
    }
  };

  const doApprove = async () => {
    if (!confirmApprove) return;
    try {
      await approveReport.mutateAsync(confirmApprove.idDonBaoCao);
      toast.success("Đã phê duyệt báo cáo");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setConfirmApprove(null);
    }
  };

  const doRefuse = async (lyDoTuChoi: string) => {
    if (!refuseTarget) return;
    try {
      await refuseReport.mutateAsync({
        id: refuseTarget.idDonBaoCao,
        lyDoTuChoi,
      });
      toast.success("Đã từ chối báo cáo");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setRefuseTarget(null);
    }
  };

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
          <Button onClick={() => navigate("/daily-report/create")}>
            <Plus className="mr-2 size-4" /> Thêm báo cáo
          </Button>
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
      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table className="w-full table-fixed min-w-[960px]">
          <ReportColGroup />
          <ReportTableHeader />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={22}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
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
                {filteredRows.map((r) => (
                  <ReportTableRow
                    key={r.idDonBaoCao}
                    row={r}
                    canEdit={!r.notSubmitted && EDITABLE.includes(r.status)}
                    canSubmit={canSubmit(r)}
                    canRecall={canRecall(r)}
                    canApprove={canApprove(r)}
                    canRefuse={canApprove(r)}
                    onViewDetail={goDetail}
                    onEdit={goEditOrCreate}
                    onSubmit={setConfirmSubmit}
                    onRecall={setConfirmRecall}
                    onApprove={setConfirmApprove}
                    onRefuse={setRefuseTarget}
                  />
                ))}
                <ReportTotalRow t={totals} absentList={absentList} />{" "}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && filteredRows.length > 0 && (
        <NhiemVuNgaySection rows={filteredRows} hasChildren={hasChildren} />
      )}

      <ConfirmDialog
        open={!!confirmSubmit}
        onOpenChange={(v) => !v && setConfirmSubmit(null)}
        title="Trình phê duyệt báo cáo"
        description="Bạn có chắc muốn trình báo cáo này lên cấp trên phê duyệt?"
        confirmText="Trình phê duyệt"
        loading={submitReport.isPending}
        onConfirm={doSubmit}
      />
      <ConfirmDialog
        open={!!confirmRecall}
        onOpenChange={(v) => !v && setConfirmRecall(null)}
        title="Thu hồi báo cáo"
        description="Thu hồi báo cáo về trạng thái nháp để chỉnh sửa?"
        confirmText="Thu hồi"
        loading={recallReport.isPending}
        onConfirm={doRecall}
      />
      <ConfirmDialog
        open={!!confirmApprove}
        onOpenChange={(v) => !v && setConfirmApprove(null)}
        title="Phê duyệt báo cáo"
        description="Xác nhận phê duyệt báo cáo của đơn vị này?"
        confirmText="Phê duyệt"
        loading={approveReport.isPending}
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
