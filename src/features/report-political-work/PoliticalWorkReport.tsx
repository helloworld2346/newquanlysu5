import { useMemo, useState, type ReactNode } from "react";
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
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { donviApi } from "@/features/units/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { politicalWorkApi } from "./api";
import {
  usePoliticalMerged,
  useTongHopPolitical,
  useSubmitPolitical,
  useConsolidatedForUnit,
  useApprovePolitical,
  useRefusePolitical,
  useUpdatePolitical,
} from "./queries";
import { mapItemToRow, createEmptyPoliticalWorkRow } from "./utils";
import type {
  PoliticalWorkRow,
  PoliticalWorkForm,
} from "@/types/politicalWork";
import RefuseDialog from "@/features/reports/components/RefuseDialog";
import {
  isPctUnit,
  isBctUnit,
  accountIsPoliticalOffice,
  accountIsBanChinhTri,
  parentMaDonVi,
} from "./politicalUnits";
import PoliticalCaTrucCard from "./components/PoliticalCaTrucCard";
import PoliticalReportCard from "./components/PoliticalReportCard";
import KySoCard from "./components/KySoCard";
import { TrucNguoi } from "@/types/politicalWork";

function parseTruc(raw: string | undefined | null): TrucNguoi | null {
  if (!raw) return null;
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
    return null;
  } catch {
    return { hoTen: raw, capBac: "", chucVu: "", soDienThoai: "" };
  }
}

export default function PoliticalWorkReport() {
  const navigate = useNavigate();
  const { account, role } = useAuthInfo();
  const ownMaDonVi = account?.donVi?.maDonVi;
  const isPctAccount = accountIsPoliticalOffice(
    account?.tenDangNhap,
    account?.donVi,
  );
  const isBctAccount = accountIsBanChinhTri(account?.donVi);
  const isPctOrBctAccount = isPctAccount || isBctAccount;

  const maDonVi = isPctAccount
    ? "GS003"
    : isBctAccount
      ? (parentMaDonVi(ownMaDonVi) ?? ownMaDonVi)
      : ownMaDonVi;

  const isChiHuy = role === "Trực chỉ huy";
  const isCommanderView = isChiHuy && !isPctOrBctAccount;

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
  const [userTab, setUserTab] = useState<"child" | "consolidated" | null>(null);

  const [chuKySo, setChuKySo] = useState("");

  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<PoliticalWorkRow | null>(
    null,
  );
  const [refuseTarget, setRefuseTarget] = useState<PoliticalWorkRow | null>(
    null,
  );

  const updateReport = useUpdatePolitical();
  const submitReport = useSubmitPolitical();
  const approveReport = useApprovePolitical();
  const refuseReport = useRefusePolitical();

  const { units, capByUnit, hideDraftForCommander, hasChildren } =
    useUnitHierarchy({
      maDonVi,
      isChiHuy: isCommanderView,
      accountDonVi: account?.donVi,
    });

  const unitsReady = units.length > 0;

  const activeTab: "child" | "consolidated" =
    userTab ?? (isCommanderView && hasChildren ? "consolidated" : "child");

  const { data: items = [], isLoading } = usePoliticalMerged(
    maDonVi,
    ngay,
    capByUnit,
    hasChildren,
    unitsReady,
    units,
  );

  const capSelf = capByUnit[maDonVi ?? ""] ?? "";

  const directChildren = useMemo(
    () =>
      units.filter((u) => {
        if (!maDonVi || !u.maDonVi.startsWith(maDonVi + ".")) return false;
        return !u.maDonVi.slice(maDonVi.length + 1).includes(".");
      }),
    [units, maDonVi],
  );

  const consolidatedChild = useMemo(
    () =>
      capSelf === "SU_DOAN"
        ? directChildren.find((u) => isPctUnit(u))
        : capSelf === "TRUNG_DOAN"
          ? directChildren.find((u) => isBctUnit(u))
          : undefined,
    [capSelf, directChildren],
  );

  const useChildConsolidated = !!consolidatedChild;

  const viewUnit = useMemo(
    () => units.find((u) => u.maDonVi === maDonVi),
    [units, maDonVi],
  );

  const childCons = useConsolidatedForUnit(
    maDonVi,
    consolidatedChild?.maDonVi,
    ngay,
    {
      enabled: useChildConsolidated,
      approvedOnly: capSelf === "SU_DOAN" && !isPctOrBctAccount,
      viewTenDonvi: isPctAccount ? "f5" : viewUnit?.tenDonvi,
      viewKyhieuDonvi: isPctAccount ? "f5" : viewUnit?.kyhieuDonvi,
    },
  );

  const ownCons = useTongHopPolitical(
    maDonVi,
    ngay,
    hasChildren && !useChildConsolidated,
  );

  const tongHopItems = useMemo(
    () =>
      useChildConsolidated ? (childCons.data ?? []) : (ownCons.data ?? []),
    [useChildConsolidated, childCons.data, ownCons.data],
  );
  const tongHopLoading = useChildConsolidated
    ? childCons.isLoading
    : ownCons.isLoading;

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

  const rows = useMemo(() => {
    const byUnit = new Map(
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

  const ownKey = isPctOrBctAccount ? ownMaDonVi : maDonVi;

  const ownDraft = useMemo(
    () => rows.find((r) => r.donVi === ownKey && isDraft(r.status)) ?? null,
    [rows, ownKey],
  );

  const ownReport = useMemo(
    () => rows.find((r) => r.donVi === ownKey && !r.notSubmitted) ?? null,
    [rows, ownKey],
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
    hasChildren && !tongHopDone && approvedChildRows.length > 0;

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
    isCommanderView &&
    !!commanderReport &&
    normalizeStatus(commanderReport.status) === "Chờ_Duyệt";

  const handleExportPoliticalExcel = async () => {
    const row = commanderReport ?? ownReport; // ⚠️ xem lưu ý bên dưới
    if (!row) {
      toast.error("Chưa có báo cáo để xuất!");
      return;
    }
    let quanSo = { siQuan: 0, qncn: 0, hsqBs: 0 };
    try {
      const q = await donviApi.getQuanSoBienChe(maDonVi!);
      quanSo = {
        siQuan: q.quanSoSiQuan,
        qncn: q.quanSoQncn,
        hsqBs: q.quanSoHsqBs,
      };
    } catch {
      /* giữ fallback 0 */
    }
    const { exportPoliticalWorkToExcel } =
      await import("./export/exportPoliticalWork");
    await exportPoliticalWorkToExcel({
      row,
      reportDate: ngay,
      tenDonVi: account?.donVi?.tenDonvi ?? "",
      quanSo,
      donViName: account?.donVi?.tenDonvi,
      parentUnitName:
        (account?.donVi as { donViCha?: string })?.donViCha ?? undefined,
      hideNoiVu: capSelf === "DAI_DOI",
    });
  };

  const handleExportPoliticalWord = async () => {
    const row = commanderReport ?? ownReport; // ⚠️ xem lưu ý
    if (!row) {
      toast.error("Chưa có báo cáo để xuất!");
      return;
    }
    let quanSo = { siQuan: 0, qncn: 0, hsqBs: 0 };
    try {
      const q = await donviApi.getQuanSoBienChe(maDonVi!);
      quanSo = {
        siQuan: q.quanSoSiQuan,
        qncn: q.quanSoQncn,
        hsqBs: q.quanSoHsqBs,
      };
    } catch {
      /* giữ fallback 0 */
    }
    const { exportPoliticalWorkToWord } =
      await import("./export/exportPoliticalWorkWord");
    await exportPoliticalWorkToWord({
      row,
      reportDate: ngay,
      tenDonVi: account?.donVi?.tenDonvi ?? "",
      quanSo,
      donViName: account?.donVi?.tenDonvi,
      parentUnitName:
        (account?.donVi as { donViCha?: string })?.donViCha ?? undefined,
      hideNoiVu: capSelf === "DAI_DOI",
    });
  };

  const effectiveTab = activeTab;

  const activeDraft = hasChildren ? tongHopDraft : ownDraft;

  const signerSource = activeDraft ?? (canApprove ? commanderReport : null);
  const signer = useMemo(
    () => parseTruc(signerSource?.trucBanCtDangCt),
    [signerSource],
  );

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
      const detail = (await politicalWorkApi.getById(target.idCongtac)).Result;
      const payload: PoliticalWorkForm = {
        tinhHinh: detail.tinhHinh,
        noiDungDotXuat: detail.noiDungDotXuat,
        ketQua: detail.ketQua,
        trucBanNoiVu: detail.trucBanNoiVu,
        trucBanCtDangCt: detail.trucBanCtDangCt,
        kienNghi: detail.kienNghi,
        donVi: detail.donVi.maDonVi,
        chuKySo,
      };
      await updateReport.mutateAsync({ id: target.idCongtac, data: payload });
      await submitReport.mutateAsync(target.idCongtac);
      toast.success("Đã trình báo cáo lên cấp trên phê duyệt.");
      setChuKySo("");
      setConfirmSubmit(false);
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

  const onClickApprove = (row: PoliticalWorkRow) => {
    if (!chuKySo) {
      toast.error("Vui lòng ký số trước khi phê duyệt.");
      return;
    }
    setConfirmApprove(row);
  };

  const doApprove = async () => {
    if (!confirmApprove) return;
    try {
      const detail = (await politicalWorkApi.getById(confirmApprove.idCongtac))
        .Result;
      const payload: PoliticalWorkForm = {
        tinhHinh: detail.tinhHinh,
        noiDungDotXuat: detail.noiDungDotXuat,
        ketQua: detail.ketQua,
        trucBanNoiVu: detail.trucBanNoiVu,
        trucBanCtDangCt: detail.trucBanCtDangCt,
        kienNghi: detail.kienNghi,
        donVi: detail.donVi.maDonVi,
        chuKySo,
      };
      await updateReport.mutateAsync({
        id: confirmApprove.idCongtac,
        data: payload,
      });
      await approveReport.mutateAsync(confirmApprove.idCongtac);
      toast.success("Đã phê duyệt báo cáo tổng hợp.");
      setChuKySo("");
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

  const submitting = updateReport.isPending || submitReport.isPending;
  const approving = updateReport.isPending || approveReport.isPending;

  const cardsLoading =
    effectiveTab === "consolidated" ? tongHopLoading : isLoading;

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
            isCommanderView ? (
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
            ) : (
              <>
                {isPctOrBctAccount &&
                  (ownDraft ? (
                    <Button
                      className="mr-2"
                      onClick={() =>
                        navigate(
                          `/political-work-report/edit/${ownDraft.idCongtac}?ngay=${ngay}`,
                        )
                      }
                    >
                      <PenLine className="mr-2 size-4" /> Sửa báo cáo đơn vị
                    </Button>
                  ) : ownReport ? null : (
                    <Button
                      className="mr-2"
                      onClick={() =>
                        navigate(`/political-work-report/create?ngay=${ngay}`)
                      }
                    >
                      <Plus className="mr-2 size-4" /> Thêm báo cáo
                    </Button>
                  ))}
                {tongHopRefused ? (
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
                    onClick={onClickSubmit}
                    disabled={!chuKySo || submitting}
                  >
                    <Send className="mr-2 size-4" /> Trình phê duyệt
                  </Button>
                ) : tongHopDone ? (
                  <span className="text-sm text-muted-foreground">
                    Đã có báo cáo cho ngày này
                  </span>
                ) : (
                  <Button
                    className="bg-amber-500 text-white hover:bg-amber-600"
                    onClick={handleConsolidate}
                    disabled={!canConsolidate}
                  >
                    <Layers className="mr-2 size-4" /> {consolidateLabel}
                  </Button>
                )}
              </>
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
            <Button
              onClick={() =>
                navigate(`/political-work-report/create?ngay=${ngay}`)
              }
            >
              <Plus className="mr-2 size-4" /> Thêm báo cáo
            </Button>
          )}
          <Button
            variant="outline"
            className="mr-2 border-[hsl(var(--tone-success-border))] bg-[hsl(var(--tone-success-bg))] text-[hsl(var(--tone-success-fg))] hover:bg-[hsl(var(--tone-success-bg))]/70"
            onClick={handleExportPoliticalExcel}
          >
            <FileSpreadsheet className="mr-2 size-4" /> Xuất Excel
          </Button>
          <Button
            variant="outline"
            className="mr-2 border-[hsl(var(--tone-info-border))] bg-[hsl(var(--tone-info-bg))] text-[hsl(var(--tone-info-fg))] hover:bg-[hsl(var(--tone-info-bg))]/70"
            onClick={handleExportPoliticalWord}
          >
            <FileText className="mr-2 size-4" /> Xuất Word
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

      {hasChildren && (
        <div className="mb-3 inline-flex items-center rounded-[10px] border bg-primary/10 p-1 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <button
            type="button"
            onClick={() => setUserTab("child")}
            className={`mr-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "child"
                ? "bg-background text-primary-text shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200"
                : "text-muted-foreground hover:text-foreground dark:text-emerald-400/70 dark:hover:text-emerald-200"
            }`}
          >
            Báo cáo đơn vị
          </button>
          <button
            type="button"
            onClick={() => setUserTab("consolidated")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "consolidated"
                ? "bg-background text-primary-text shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200"
                : "text-muted-foreground hover:text-foreground dark:text-emerald-400/70 dark:hover:text-emerald-200"
            }`}
          >
            Báo cáo tổng hợp
          </button>
        </div>
      )}

      {cardsLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={`sk-${i}`}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayRows.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border bg-background text-muted-foreground">
          {hasFilter
            ? "Không tìm thấy báo cáo phù hợp"
            : "Chưa có báo cáo cho ngày này"}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 ${
            displayRows.length === 1 ? "" : "lg:grid-cols-2"
          }`}
        >
          {displayRows.map((r) => (
            <PoliticalReportCard
              key={r.idCongtac || r.donVi}
              row={r}
              onDetail={goDetail}
              onEditOrCreate={goEditOrCreate}
            />
          ))}
        </div>
      )}
      <PoliticalCaTrucCard ngay={ngay} maDonVi={ownMaDonVi} />

      {((activeDraft && !hasChildren) ||
        (activeDraft && hasChildren && !isChiHuy) ||
        canApprove) && (
        <KySoCard chuKySo={chuKySo} setChuKySo={setChuKySo} signer={signer} />
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
    </div>
  );
}
