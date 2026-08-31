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
  ImagePlus,
  User,
  Award,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface TrucNguoi {
  hoTen: string;
  capBac: string;
  chucVu: string;
  soDienThoai: string;
}

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

const STATUS_LABEL: Record<string, string> = {
  Chờ_Duyệt: "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  Đã_Duyệt: "Đã duyệt",
  Da_Duyet: "Đã duyệt",
  Tu_Choi: "Từ chối",
  Từ_Chối: "Từ chối",
  "Từ chối": "Từ chối",
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

function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function FlagDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        active ? "text-rose-700" : "text-muted-foreground"
      }`}
    >
      <span
        className={`inline-block size-2 rounded-full ${
          active ? "bg-rose-500" : "bg-muted-foreground/30"
        }`}
      />
      {label}
    </span>
  );
}

function Section({
  label,
  value,
  tone,
  labelTone,
  textTone,
  empty = "—",
}: {
  label: string;
  value: string;
  tone: string;
  labelTone: string;
  textTone: string;
  empty?: string;
}) {
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div
        className={`mb-1 text-xs font-semibold uppercase tracking-wide ${labelTone}`}
      >
        {label}
      </div>
      <div className={`whitespace-pre-wrap break-words text-sm ${textTone}`}>
        {value || empty}
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<"child" | "consolidated">("child");

  const [chuKySo, setChuKySo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const childCons = useConsolidatedForUnit(
    maDonVi,
    consolidatedChild?.maDonVi,
    ngay,
    {
      enabled: useChildConsolidated,
      approvedOnly: capSelf === "SU_DOAN" && !isPctOrBctAccount,
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
    isCommanderView &&
    !!commanderReport &&
    normalizeStatus(commanderReport.status) === "Chờ_Duyệt";

  const effectiveTab =
    isCommanderView && hasChildren ? "consolidated" : activeTab;

  const activeDraft = hasChildren ? tongHopDraft : ownDraft;

  const signerSource = activeDraft ?? (canApprove ? commanderReport : null);
  const signer = useMemo(
    () => parseTruc(signerSource?.trucBanCtDangCt),
    [signerSource],
  );

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
              <Button onClick={onClickSubmit} disabled={!chuKySo || submitting}>
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

      {hasChildren && !isCommanderView && (
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
          {displayRows.map((r) => {
            const canEdit =
              r.notSubmitted ||
              ["Nháp", "Từ_Chối", "Từ chối"].includes(r.status);
            return (
              <Card
                key={r.idCongtac || r.donVi}
                className={
                  r.notSubmitted ? "border-rose-200 bg-rose-50/60" : undefined
                }
              >
                <CardHeader className="relative space-y-0 pb-3">
                  <div className="absolute right-4 top-4 flex shrink-0 items-center gap-1">
                    {!r.notSubmitted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => goDetail(r)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => goEditOrCreate(r)}
                      >
                        <PenLine className="size-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col items-center px-10 text-center">
                    <div
                      className={`text-3xl font-bold ${
                        r.notSubmitted ? "text-rose-700" : ""
                      }`}
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
                    empty="—"
                  />
                  <Section
                    label="Kiến nghị"
                    value={r.kienNghi}
                    tone="border-rose-200 bg-rose-50"
                    labelTone="text-rose-700"
                    textTone="text-rose-900"
                    empty="—"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {((activeDraft && !hasChildren) ||
        (activeDraft && hasChildren && !isChiHuy) ||
        canApprove) && (
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
                  <div className="flex h-full items-center justify-center rounded-lg border bg-[length:16px_16px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] p-4">
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
                        value={signer?.hoTen}
                      />
                      <SignerRow
                        icon={<Award className="size-3.5" />}
                        label="Cấp bậc"
                        value={signer?.capBac}
                      />
                      <SignerRow
                        icon={<Briefcase className="size-3.5" />}
                        label="Chức vụ"
                        value={signer?.chucVu}
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
    </div>
  );
}
