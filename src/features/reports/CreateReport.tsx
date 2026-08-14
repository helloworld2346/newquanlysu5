import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Trash2,
  ArrowLeft,
  Plus,
  Save,
  Copy,
  AlertTriangle,
  Layers,
} from "lucide-react";
import api from "@/lib/api";
import { reportApi } from "./api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthInfo } from "@/features/auth/queries";
import { useCreateReport, useUpdateReport } from "./queries";
import {
  LY_DO_OPTIONS,
  CAP_BAC_OPTIONS,
  EMPTY_VANG,
  classifyCapBac,
  todayIso,
} from "./utils";
import type {
  AbsentRow,
  TrucNguoiInfo,
  DetailStepData,
  CreateReportRequest,
  VangChiTiet,
  ReportItemDTO,
} from "@/types/dailyReport";
import { useUnits } from "@/features/units/queries";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import type { DonVi } from "@/types/account";

const genId = () => Math.random().toString(36).slice(2);

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const COMMAND_KYHIEU = ["CH/e", "CH/f"];
const EXPAND_CAPS = ["SU_DOAN", "TRUNG_DOAN"];

type Agg = { siQuan: number; qncn: number; hsqBs: number };

function getDirectChildren(maDonVi: string, all: DonVi[]): DonVi[] {
  return all.filter((u) => {
    if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
    return !u.maDonVi.slice(maDonVi.length + 1).includes(".");
  });
}

function unitFullAgg(unit: DonVi, all: DonVi[]): Agg {
  const own: Agg = {
    siQuan: unit.quanSoSiQuan ?? 0,
    qncn: unit.quanSoQncn ?? 0,
    hsqBs: unit.quanSoHsqBs ?? 0,
  };
  if (!EXPAND_CAPS.includes(unit.capDonVi ?? "")) return own;
  const children = getDirectChildren(unit.maDonVi, all).filter(
    (u) => !COMMAND_KYHIEU.includes(u.kyhieuDonvi),
  );
  return children.reduce((acc, c) => {
    const t = unitFullAgg(c, all);
    return {
      siQuan: acc.siQuan + t.siQuan,
      qncn: acc.qncn + t.qncn,
      hsqBs: acc.hsqBs + t.hsqBs,
    };
  }, own);
}

function getPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

const TONG_HOP_CAPS = ["TRUNG_DOAN", "TIEU_DOAN"];
const APPROVED_STATUSES = ["Da_Duyet", "Đã_Duyệt", "Đã duyệt"];
const isApproved = (s: string) => APPROVED_STATUSES.includes(s);

const EMPTY_TRUC: TrucNguoiInfo = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

const EMPTY_DETAIL: DetailStepData = {
  securityStatus: "",
  incidentStatus: "",
  incidentDetail: "",
  advantageStatus: "",
  advantageDetail: "",
  disadvantageStatus: "",
  disadvantageDetail: "",
  pendingTaskStatus: "",
  pendingDetail: "",
};

type NhiemVuNgayPayload = {
  nhiemVuPhandoi: string;
  noiDungDotXuat: string;
  noiDungUuDiem: string;
  noiDungKhuyetDiem: string;
  noiDungCanGiaiQuyet: string;
  donBaoCao: string;
};
type NhiemVuNgay = {
  idNhiemvuNgay?: string;
  nhiemVuPhandoi?: string;
  noiDungDotXuat?: string;
  noiDungUuDiem?: string;
  noiDungKhuyetDiem?: string;
  noiDungCanGiaiQuyet?: string;
};

async function fetchNhiemVu(idDonBaoCao: string): Promise<NhiemVuNgay | null> {
  try {
    const res = await api.get(`/nhiemvungay/donbaocao/${idDonBaoCao}`, {
      skipErrorToast: true,
    });
    return (res.data?.Result as NhiemVuNgay) ?? null;
  } catch {
    return null;
  }
}

async function saveNhiemVu(idDonBaoCao: string, detail: DetailStepData) {
  const payload = detailToNhiemVu(detail, idDonBaoCao);
  const existing = await fetchNhiemVu(idDonBaoCao);
  try {
    if (existing?.idNhiemvuNgay) {
      await api.put(`/nhiemvungay/${existing.idNhiemvuNgay}`, payload, {
        skipErrorToast: true,
      });
    } else {
      await api.post(`/nhiemvungay`, payload, { skipErrorToast: true });
    }
  } catch {
    /* không chặn lưu báo cáo chính nếu nhiệm vụ ngày lỗi */
  }
}

function detailToNhiemVu(
  d: DetailStepData,
  donBaoCao: string,
): NhiemVuNgayPayload {
  return {
    nhiemVuPhandoi: d.securityStatus,
    noiDungDotXuat: d.incidentStatus === "yes" ? d.incidentDetail : "",
    noiDungUuDiem: d.advantageStatus === "yes" ? d.advantageDetail : "",
    noiDungKhuyetDiem:
      d.disadvantageStatus === "yes" ? d.disadvantageDetail : "",
    noiDungCanGiaiQuyet: d.pendingTaskStatus === "yes" ? d.pendingDetail : "",
    donBaoCao,
  };
}

function nhiemVuToDetail(nv: NhiemVuNgay): DetailStepData {
  const sec = nv.nhiemVuPhandoi;
  return {
    securityStatus: sec === "safe" || sec === "unsafe" ? sec : "",
    incidentStatus: nv.noiDungDotXuat ? "yes" : "no",
    incidentDetail: nv.noiDungDotXuat ?? "",
    advantageStatus: nv.noiDungUuDiem ? "yes" : "no",
    advantageDetail: nv.noiDungUuDiem ?? "",
    disadvantageStatus: nv.noiDungKhuyetDiem ? "yes" : "no",
    disadvantageDetail: nv.noiDungKhuyetDiem ?? "",
    pendingTaskStatus: nv.noiDungCanGiaiQuyet ? "yes" : "no",
    pendingDetail: nv.noiDungCanGiaiQuyet ?? "",
  };
}

type Errors = Record<string, string>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center text-sm text-red-600">
      <AlertTriangle className="mr-1 size-3.5 shrink-0" />
      {msg}
    </p>
  );
}

function ReqLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-sm text-muted-foreground">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function TrucSection({
  title,
  value,
  onChange,
  prefix,
  errors,
  clearError,
}: {
  title: string;
  value: TrucNguoiInfo;
  onChange: (v: TrucNguoiInfo) => void;
  prefix: string;
  errors: Errors;
  clearError: (key: string) => void;
}) {
  const errClass = (key: string) =>
    errors[`${prefix}.${key}`]
      ? "border-red-500 focus-visible:ring-red-500"
      : "";

  return (
    <div className="-mx-1.5 flex flex-wrap">
      <div className="w-full px-1.5 mb-3 text-sm font-semibold">{title}</div>
      <div className="w-full px-1.5 mb-3 sm:w-1/2 lg:w-1/4">
        <ReqLabel required>Họ và tên</ReqLabel>
        <Input
          className={errClass("ten")}
          placeholder="Nhập họ và tên..."
          value={value.tenNguoitruc}
          onChange={(e) => {
            onChange({ ...value, tenNguoitruc: e.target.value });
            clearError(`${prefix}.ten`);
          }}
        />
        <FieldError msg={errors[`${prefix}.ten`]} />
      </div>
      <div className="w-full px-1.5 mb-3 sm:w-1/2 lg:w-1/4">
        <ReqLabel required>Cấp bậc</ReqLabel>
        <Select
          value={value.capbacNguoitruc}
          onValueChange={(v) => {
            onChange({ ...value, capbacNguoitruc: v });
            clearError(`${prefix}.capBac`);
          }}
        >
          <SelectTrigger className={errClass("capBac")}>
            <SelectValue placeholder="-- Cấp bậc --" />
          </SelectTrigger>
          <SelectContent>
            {CAP_BAC_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError msg={errors[`${prefix}.capBac`]} />
      </div>
      <div className="w-full px-1.5 mb-3 sm:w-1/2 lg:w-1/4">
        <ReqLabel required>Chức vụ</ReqLabel>
        <Input
          className={errClass("chucVu")}
          placeholder="Nhập chức vụ..."
          value={value.chucvuNguoitruc}
          onChange={(e) => {
            onChange({ ...value, chucvuNguoitruc: e.target.value });
            clearError(`${prefix}.chucVu`);
          }}
        />
        <FieldError msg={errors[`${prefix}.chucVu`]} />
      </div>
      <div className="w-full px-1.5 mb-3 sm:w-1/2 lg:w-1/4">
        <ReqLabel>Số điện thoại</ReqLabel>
        <Input
          placeholder="Nhập số điện thoại..."
          value={value.sodienthoai}
          onChange={(e) => onChange({ ...value, sodienthoai: e.target.value })}
        />
      </div>
    </div>
  );
}

function RadioRow({
  value,
  options,
  onChange,
  hasError,
}: {
  value: string;
  options: { value: string; label: string; tone?: "success" | "danger" }[];
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <div className="-mb-2 flex flex-wrap">
      {options.map((o) => {
        const active = value === o.value;
        const tone = o.tone ?? "success";
        const activeCls =
          tone === "danger"
            ? "border-rose-200 bg-rose-100 text-rose-700"
            : "border-emerald-200 bg-emerald-100 text-emerald-700";
        const idleCls =
          tone === "danger"
            ? "border-input bg-background text-foreground hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            : "border-input bg-background text-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700";
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              "mb-2 mr-2 inline-flex select-none items-center gap-1 rounded-lg border px-4 py-1.5 text-sm font-semibold transition-colors " +
              (active ? activeCls : idleCls) +
              (hasError && !active ? " border-red-400" : "")
            }
          >
            {active && <span aria-hidden>{tone === "danger" ? "✕" : "✓"}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CreateReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { account } = useAuthInfo();
  const donVi = account?.donVi;
  const isDaiDoi = donVi?.capDonVi === "DAI_DOI";
  const tacChienLabel =
    donVi?.capDonVi === "TRUNG_DOAN" || donVi?.capDonVi === "SU_DOAN"
      ? "Trực ban tác chiến"
      : "Trực ban nội vụ";

  const { data: units = [] } = useUnits();
  const fullDonVi = useMemo(
    () => units.find((u) => u.maDonVi === donVi?.maDonVi) ?? null,
    [units, donVi?.maDonVi],
  );

  const capByUnit = useMemo(() => {
    const m: Record<string, string> = {};
    units.forEach((u) => {
      m[u.maDonVi] = u.capDonVi ?? "";
    });
    return m;
  }, [units]);

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();

  const [searchParams] = useSearchParams();
  const ngayParam = searchParams.get("ngay");
  const isTongHop = searchParams.get("tongHop") === "1" && !isEdit;
  const [ngayBaoCao, setNgayBaoCao] = useState(ngayParam || todayIso());

  const [aggTongQuanSo, setAggTongQuanSo] = useState(0);
  const [isAggregatingReport, setIsAggregatingReport] = useState(false);
  const isAggregating = isTongHop || isAggregatingReport;
  const tongQuanSo = isAggregating
    ? aggTongQuanSo
    : (fullDonVi?.quanSoTong ?? 0);

  const [trucChiHuy, setTrucChiHuy] = useState<TrucNguoiInfo>({
    ...EMPTY_TRUC,
  });
  const [trucBanTacChien, setTrucBanTacChien] = useState<TrucNguoiInfo>({
    ...EMPTY_TRUC,
  });
  const [absentRows, setAbsentRows] = useState<AbsentRow[]>([]);
  const [detail, setDetail] = useState<DetailStepData>({ ...EMPTY_DETAIL });
  const [copying, setCopying] = useState(false);
  const [aggLoading, setAggLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [errors, setErrors] = useState<Errors>({});
  const clearError = (key: string) =>
    setErrors((p) => {
      if (!p[key]) return p;
      const n = { ...p };
      delete n[key];
      return n;
    });

  useEffect(() => {
    if (!isEdit || !id) return;
    let ignore = false;

    (async () => {
      try {
        const res = await reportApi.getById(id);
        const r = res.Result;
        if (!ignore && r) {
          if (r.thoiGianBaoCao) {
            setNgayBaoCao(r.thoiGianBaoCao.slice(0, 10));
          }
          if (r.loaiDonBaoCao === "TONG_HOP") {
            setIsAggregatingReport(true);
            setAggTongQuanSo(r.quanSoTong ?? 0);
          }
          try {
            if (r.trucBanChiHuy)
              setTrucChiHuy({ ...EMPTY_TRUC, ...JSON.parse(r.trucBanChiHuy) });
          } catch {
            /* ignore */
          }
          try {
            if (r.trucBanTacChien)
              setTrucBanTacChien({
                ...EMPTY_TRUC,
                ...JSON.parse(r.trucBanTacChien),
              });
          } catch {
            /* ignore */
          }
          try {
            if (r.chiTietVang) {
              const rows = JSON.parse(r.chiTietVang) as AbsentRow[];
              setAbsentRows(rows.map((row) => ({ ...row, id: genId() })));
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }

      const nv = await fetchNhiemVu(id);
      if (!ignore) {
        if (nv) {
          setDetail(nhiemVuToDetail(nv));
        } else {
          // báo cáo cũ chưa có bản ghi nhiệm vụ → gán mặc định hợp lệ, không ép chọn lại
          setDetail({
            securityStatus: "safe",
            incidentStatus: "no",
            incidentDetail: "",
            advantageStatus: "no",
            advantageDetail: "",
            disadvantageStatus: "no",
            disadvantageDetail: "",
            pendingTaskStatus: "no",
            pendingDetail: "",
          });
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isEdit, id]);

  useEffect(() => {
    if (!isTongHop || !donVi?.maDonVi || units.length === 0) return;
    let ignore = false;

    (async () => {
      setAggLoading(true);
      try {
        const [donViRes, tongHopRes] = await Promise.all([
          reportApi.searchChildren(donVi.maDonVi, ngayBaoCao, "DON_VI"),
          reportApi.searchChildren(donVi.maDonVi, ngayBaoCao, "TONG_HOP"),
        ]);

        const map = new Map<string, ReportItemDTO>();
        for (const item of donViRes.Result ?? []) {
          const ma = item.donVi.maDonVi;
          const isAggregating = TONG_HOP_CAPS.includes(capByUnit[ma] ?? "");
          if (!isAggregating || ma === donVi.maDonVi) map.set(ma, item);
        }
        for (const item of tongHopRes.Result ?? []) {
          const ma = item.donVi.maDonVi;
          const isAggregating = TONG_HOP_CAPS.includes(capByUnit[ma] ?? "");
          if (isAggregating || ma === donVi.maDonVi || !map.has(ma))
            map.set(ma, item);
        }

        const children = Array.from(map.values()).filter(
          (it) => it.donVi.maDonVi !== donVi.maDonVi && isApproved(it.status),
        );

        const allAbsent: AbsentRow[] = [];
        let sumTong = 0;
        for (const it of children) {
          sumTong += it.quanSoTong ?? 0;
          try {
            if (it.chiTietVang) {
              const rows = JSON.parse(it.chiTietVang) as AbsentRow[];
              rows.forEach((row) => allAbsent.push({ ...row, id: genId() }));
            }
          } catch {
            /* ignore */
          }
        }

        if (!ignore) {
          setAbsentRows(allAbsent);
          setAggTongQuanSo(sumTong);
        }
      } finally {
        if (!ignore) setAggLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isTongHop, donVi?.maDonVi, ngayBaoCao, units.length, capByUnit]);

  const quanSoVang = absentRows.length;
  const quanSoHienDien = Math.max(0, tongQuanSo - quanSoVang);

  const bienChe = useMemo<Agg>(() => {
    if (isAggregating && fullDonVi) return unitFullAgg(fullDonVi, units);
    return {
      siQuan: fullDonVi?.quanSoSiQuan ?? 0,
      qncn: fullDonVi?.quanSoQncn ?? 0,
      hsqBs: fullDonVi?.quanSoHsqBs ?? 0,
    };
  }, [isAggregating, fullDonVi, units]);

  const warnings = useMemo(() => {
    const by = { siQuan: 0, qncn: 0, hsqBs: 0 };
    absentRows.forEach(
      (r) => r.capBac.trim() && by[classifyCapBac(r.capBac)]++,
    );
    const w: string[] = [];
    if ((bienChe.siQuan ?? 0) > 0 && by.siQuan > bienChe.siQuan)
      w.push(`Vắng Sĩ quan (${by.siQuan}) vượt biên chế (${bienChe.siQuan}).`);
    if ((bienChe.qncn ?? 0) > 0 && by.qncn > bienChe.qncn)
      w.push(`Vắng QNCN (${by.qncn}) vượt biên chế (${bienChe.qncn}).`);
    if ((bienChe.hsqBs ?? 0) > 0 && by.hsqBs > bienChe.hsqBs)
      w.push(`Vắng HSQ-BS (${by.hsqBs}) vượt biên chế (${bienChe.hsqBs}).`);
    return w;
  }, [absentRows, bienChe]);

  const totalPages = Math.max(1, Math.ceil(absentRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedAbsent = absentRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const addRow = () =>
    setAbsentRows((p) => [
      ...p,
      {
        id: genId(),
        hoTen: "",
        capBac: "",
        chucVu: "",
        lyDoVang: "",
        ghiChu: "",
      },
    ]);
  const updateRow = (rid: string, field: keyof AbsentRow, v: string) => {
    setAbsentRows((p) =>
      p.map((r) => (r.id === rid ? { ...r, [field]: v } : r)),
    );
    clearError(`row.${rid}.${field}`);
  };
  const removeRow = (rid: string) =>
    setAbsentRows((p) => p.filter((r) => r.id !== rid));

  const validate = (): Errors => {
    const e: Errors = {};
    const t = trucChiHuy;
    if (!t.tenNguoitruc.trim())
      e["chiHuy.ten"] = "Nhập họ và tên trực chỉ huy.";
    if (!t.capbacNguoitruc.trim()) e["chiHuy.capBac"] = "Chọn cấp bậc.";
    if (!t.chucvuNguoitruc.trim()) e["chiHuy.chucVu"] = "Nhập chức vụ.";

    absentRows.forEach((r) => {
      if (!r.hoTen.trim()) e[`row.${r.id}.hoTen`] = "Nhập họ và tên.";
      if (!r.capBac.trim()) e[`row.${r.id}.capBac`] = "Chọn cấp bậc.";
      if (!r.lyDoVang) e[`row.${r.id}.lyDoVang`] = "Chọn lý do vắng.";
    });

    if (tongQuanSo > 0 && quanSoVang > tongQuanSo)
      e["tongVang"] =
        `Tổng vắng (${quanSoVang}) vượt tổng quân số (${tongQuanSo}).`;

    if (!detail.securityStatus) e["securityStatus"] = "Vui lòng chọn một mục.";
    if (!detail.incidentStatus) e["incidentStatus"] = "Vui lòng chọn một mục.";
    if (!detail.advantageStatus)
      e["advantageStatus"] = "Vui lòng chọn một mục.";
    if (!detail.disadvantageStatus)
      e["disadvantageStatus"] = "Vui lòng chọn một mục.";
    if (!detail.pendingTaskStatus)
      e["pendingTaskStatus"] = "Vui lòng chọn một mục.";

    if (detail.incidentStatus === "yes" && !detail.incidentDetail.trim())
      e["incidentDetail"] = "Nhập chi tiết khi chọn Có.";
    if (detail.advantageStatus === "yes" && !detail.advantageDetail.trim())
      e["advantageDetail"] = "Vui lòng nhập nội dung ưu điểm.";
    if (
      detail.disadvantageStatus === "yes" &&
      !detail.disadvantageDetail.trim()
    )
      e["disadvantageDetail"] = "Vui lòng nhập nội dung khuyết điểm.";
    if (detail.pendingTaskStatus === "yes" && !detail.pendingDetail.trim())
      e["pendingDetail"] = "Vui lòng nhập nội dung cần giải quyết.";
    return e;
  };

  const handleCopyYesterday = async () => {
    if (!donVi?.maDonVi) return;

    const d = new Date(ngayBaoCao);
    d.setDate(d.getDate() - 1);
    const yesterday = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");

    setCopying(true);
    try {
      const res = await reportApi.searchByUnitAndDate(
        donVi.maDonVi,
        yesterday,
        "DON_VI",
      );
      if (!res.success || !res.Result) {
        toast.warning(`Không tìm thấy báo cáo ngày ${yesterday}.`);
        return;
      }
      const r = res.Result;

      try {
        if (r.trucBanChiHuy)
          setTrucChiHuy({ ...EMPTY_TRUC, ...JSON.parse(r.trucBanChiHuy) });
      } catch {
        /* ignore */
      }
      try {
        if (r.trucBanTacChien)
          setTrucBanTacChien({
            ...EMPTY_TRUC,
            ...JSON.parse(r.trucBanTacChien),
          });
      } catch {
        /* ignore */
      }

      try {
        if (r.chiTietVang) {
          const rows = JSON.parse(r.chiTietVang) as AbsentRow[];
          setAbsentRows(rows.map((row) => ({ ...row, id: genId() })));
        }
      } catch {
        /* ignore */
      }

      const nv = await fetchNhiemVu(r.idDonBaoCao);
      if (nv) setDetail(nhiemVuToDetail(nv));

      toast.success("Đã sao chép báo cáo hôm qua");
    } catch {
      toast.warning(`Không tìm thấy báo cáo ngày ${yesterday}.`);
    } finally {
      setCopying(false);
    }
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const vang: VangChiTiet = { ...EMPTY_VANG };
    absentRows.forEach((r) => {
      if (r.lyDoVang && r.lyDoVang in vang)
        vang[r.lyDoVang as keyof VangChiTiet]++;
    });

    const payload: CreateReportRequest = {
      quanSoTong: tongQuanSo,
      quanSoHienDien,
      quanSoVang,
      thoiGianBaoCao: new Date(`${ngayBaoCao}T12:00:00.000Z`).toISOString(),
      chiTietVang: JSON.stringify(absentRows),
      thongTinVang: JSON.stringify(vang),
      donVi: donVi?.maDonVi ?? "",
      trucBanChiHuy: JSON.stringify(trucChiHuy),
      trucBanTacChien: JSON.stringify(isDaiDoi ? EMPTY_TRUC : trucBanTacChien),
      loaiDonBaoCao: isAggregating ? "TONG_HOP" : "DON_VI",
    };

    try {
      let idDonBaoCao = id ?? "";
      if (isEdit) {
        const res = await updateReport.mutateAsync({ id: id!, data: payload });
        if (!res.success) throw new Error(res.message);
        idDonBaoCao = res.Result?.idDonBaoCao ?? id!;
        toast.success("Cập nhật báo cáo thành công");
      } else {
        const res = await createReport.mutateAsync(payload);
        if (!res.success) throw new Error(res.message);
        idDonBaoCao = res.Result?.idDonBaoCao ?? "";
        toast.success(
          isTongHop ? "Tổng hợp báo cáo thành công" : "Lưu báo cáo thành công",
        );
      }

      if (idDonBaoCao) await saveNhiemVu(idDonBaoCao, detail);

      navigate(`/daily-report?ngay=${ngayBaoCao}`);
    } catch {
      toast.error("Không thể lưu báo cáo");
    }
  };

  const saving = createReport.isPending || updateReport.isPending;

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/daily-report?ngay=${ngayBaoCao}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEdit
              ? "Cập nhật báo cáo quân số"
              : isTongHop
                ? "Tổng hợp báo cáo quân số"
                : "Tạo báo cáo quân số hằng ngày"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {!isTongHop && (
            <Button
              variant="outline"
              onClick={handleCopyYesterday}
              disabled={copying || saving}
            >
              <Copy className="mr-2 size-4" />
              {copying ? "Đang tải..." : "Sao chép từ hôm qua"}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || aggLoading}>
            <Save className="mr-2 size-4" />{" "}
            {saving ? "Đang lưu..." : "Lưu báo cáo"}
          </Button>
        </div>
      </div>

      {isTongHop && (
        <div className="flex items-center rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          <Layers className="mr-2 size-4 shrink-0" />
          {aggLoading
            ? "Đang tổng hợp số liệu từ các đơn vị đã duyệt..."
            : `Báo cáo tổng hợp: đã gộp ${quanSoVang} quân nhân vắng và tổng biên chế ${tongQuanSo} từ các đơn vị đã duyệt.`}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="-mx-1.5 flex flex-wrap">
          <div className="w-1/2 px-1.5 mb-3 sm:w-1/4">
            <label className="text-sm text-muted-foreground">
              Ngày báo cáo
            </label>
            <Input type="date" value={ngayBaoCao} disabled />
          </div>
          <div className="w-1/2 px-1.5 mb-3 sm:w-1/4">
            <label className="text-sm text-muted-foreground">
              Tổng quân số biên chế
            </label>
            <Input value={tongQuanSo} disabled />
          </div>
          <div className="w-1/2 px-1.5 mb-3 sm:w-1/4">
            <label className="text-sm text-muted-foreground">
              Quân số hiện diện
            </label>
            <Input value={quanSoHienDien} disabled />
          </div>
          <div className="w-1/2 px-1.5 mb-3 sm:w-1/4">
            <label className="text-sm text-muted-foreground">Tổng vắng</label>
            <Input value={quanSoVang} disabled />
            <FieldError msg={errors["tongVang"]} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trực ban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrucSection
            title="Trực chỉ huy"
            value={trucChiHuy}
            onChange={setTrucChiHuy}
            prefix="chiHuy"
            errors={errors}
            clearError={clearError}
          />
          {!isDaiDoi && (
            <TrucSection
              title={tacChienLabel}
              value={trucBanTacChien}
              onChange={setTrucBanTacChien}
              prefix="tacChien"
              errors={errors}
              clearError={clearError}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">
            Danh sách quân nhân vắng mặt
          </CardTitle>
          <Button
            size="sm"
            onClick={addRow}
            className="bg-red-800 text-white hover:bg-red-700"
          >
            <Plus className="mr-2 size-4" /> Thêm quân nhân vắng
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {warnings.length > 0 && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
              {warnings.map((w, i) => (
                <div key={i}>⚠ {w}</div>
              ))}
            </div>
          )}
          {absentRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có quân nhân vắng. Bấm "Thêm quân nhân vắng" để nhập.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-[52px] border p-2 text-center">STT</th>
                    <th className="border p-2 text-left">
                      Họ và tên <span className="text-red-500">*</span>
                    </th>
                    <th className="w-[160px] border p-2 text-left">
                      Cấp bậc <span className="text-red-500">*</span>
                    </th>
                    <th className="w-[170px] border p-2 text-left">Chức vụ</th>
                    <th className="w-[240px] border p-2 text-left">
                      Lý do vắng <span className="text-red-500">*</span>
                    </th>
                    <th className="border p-2 text-left">Ghi chú chi tiết</th>
                    <th className="w-[56px] border p-2 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAbsent.map((row, index) => (
                    <tr key={row.id}>
                      <td className="border p-2 text-center align-top pt-3.5">
                        {(safePage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border p-1.5 align-top">
                        <Input
                          className={
                            errors[`row.${row.id}.hoTen`]
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                          value={row.hoTen}
                          onChange={(e) =>
                            updateRow(row.id, "hoTen", e.target.value)
                          }
                          placeholder="Nhập họ và tên..."
                        />
                        <FieldError msg={errors[`row.${row.id}.hoTen`]} />
                      </td>
                      <td className="border p-1.5 align-top">
                        <Select
                          value={row.capBac}
                          onValueChange={(v) => updateRow(row.id, "capBac", v)}
                        >
                          <SelectTrigger
                            className={
                              errors[`row.${row.id}.capBac`]
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="-- Cấp bậc --" />
                          </SelectTrigger>
                          <SelectContent>
                            {CAP_BAC_OPTIONS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError msg={errors[`row.${row.id}.capBac`]} />
                      </td>
                      <td className="border p-1.5 align-top">
                        <Input
                          value={row.chucVu}
                          onChange={(e) =>
                            updateRow(row.id, "chucVu", e.target.value)
                          }
                          placeholder="Nhập chức vụ..."
                        />
                      </td>
                      <td className="border p-1.5 align-top">
                        <Select
                          value={row.lyDoVang}
                          onValueChange={(v) =>
                            updateRow(row.id, "lyDoVang", v)
                          }
                        >
                          <SelectTrigger
                            className={
                              errors[`row.${row.id}.lyDoVang`]
                                ? "border-red-500 focus-visible:ring-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="-- Lý do vắng --" />
                          </SelectTrigger>
                          <SelectContent>
                            {LY_DO_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError msg={errors[`row.${row.id}.lyDoVang`]} />
                      </td>
                      <td className="border p-1.5 align-top">
                        <Input
                          value={row.ghiChu}
                          onChange={(e) =>
                            updateRow(row.id, "ghiChu", e.target.value)
                          }
                          placeholder="Nơi công tác, bệnh xá, học viện..."
                        />
                      </td>
                      <td className="border p-1.5 text-center align-top">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(row.id)}
                          aria-label="Xóa dòng"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
              <span className="ml-2 text-sm text-muted-foreground">dòng</span>
            </div>
            {totalPages > 1 && (
              <div className="mb-2 rounded-lg border bg-background px-2 py-1">
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                            onClick={() => setPage(p)}
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
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Tình hình nhiệm vụ trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="-mx-2 flex flex-wrap">
          <div className="w-full px-2 mb-4 lg:w-1/2">
            <div className="h-full space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">
                I. Nhiệm vụ các phân đội đóng quân canh phòng
              </p>
              <RadioRow
                value={detail.securityStatus}
                hasError={!!errors["securityStatus"]}
                options={[
                  { value: "safe", label: "Đảm bảo an toàn", tone: "success" },
                  {
                    value: "unsafe",
                    label: "Không đảm bảo an toàn",
                    tone: "danger",
                  },
                ]}
                onChange={(v) => {
                  setDetail((d) => ({ ...d, securityStatus: v }));
                  clearError("securityStatus");
                }}
              />
              <FieldError msg={errors["securityStatus"]} />
            </div>
          </div>

          <div className="w-full px-2 mb-4 lg:w-1/2">
            <div className="h-full space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">
                II. Tình hình đột xuất trong ngày
              </p>
              <RadioRow
                value={detail.incidentStatus}
                hasError={!!errors["incidentStatus"]}
                options={[
                  { value: "yes", label: "Có", tone: "danger" },
                  { value: "no", label: "Không", tone: "success" },
                ]}
                onChange={(v) => {
                  setDetail((d) => ({
                    ...d,
                    incidentStatus: v,
                    incidentDetail: v === "no" ? "" : d.incidentDetail,
                  }));
                  clearError("incidentStatus");
                  if (v === "no") clearError("incidentDetail");
                }}
              />
              <FieldError msg={errors["incidentStatus"]} />
              {detail.incidentStatus === "yes" && (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Nhập nội dung..."
                    value={detail.incidentDetail}
                    onChange={(e) => {
                      setDetail((d) => ({
                        ...d,
                        incidentDetail: e.target.value,
                      }));
                      clearError("incidentDetail");
                    }}
                    className={
                      errors["incidentDetail"]
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  <FieldError msg={errors["incidentDetail"]} />
                </>
              )}
            </div>
          </div>

          <div className="w-full px-2 mb-4 lg:w-1/2">
            <div className="h-full space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">III. Ưu điểm trong ngày</p>
              <RadioRow
                value={detail.advantageStatus}
                hasError={!!errors["advantageStatus"]}
                options={[
                  { value: "yes", label: "Có", tone: "success" },
                  { value: "no", label: "Không", tone: "danger" },
                ]}
                onChange={(v) => {
                  setDetail((d) => ({
                    ...d,
                    advantageStatus: v,
                    advantageDetail: v === "no" ? "" : d.advantageDetail,
                  }));
                  clearError("advantageStatus");
                }}
              />
              <FieldError msg={errors["advantageStatus"]} />
              {detail.advantageStatus === "yes" && (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Nhập nội dung..."
                    value={detail.advantageDetail}
                    onChange={(e) => {
                      setDetail((d) => ({
                        ...d,
                        advantageDetail: e.target.value,
                      }));
                      clearError("advantageDetail");
                    }}
                    className={
                      errors["advantageDetail"]
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  <FieldError msg={errors["advantageDetail"]} />
                </>
              )}
            </div>
          </div>

          <div className="w-full px-2 mb-4 lg:w-1/2">
            <div className="h-full space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">
                IV. Khuyết điểm trong ngày
              </p>
              <RadioRow
                value={detail.disadvantageStatus}
                hasError={!!errors["disadvantageStatus"]}
                options={[
                  { value: "yes", label: "Có", tone: "danger" },
                  { value: "no", label: "Không", tone: "success" },
                ]}
                onChange={(v) => {
                  setDetail((d) => ({
                    ...d,
                    disadvantageStatus: v,
                    disadvantageDetail: v === "no" ? "" : d.disadvantageDetail,
                  }));
                  clearError("disadvantageStatus");
                }}
              />
              <FieldError msg={errors["disadvantageStatus"]} />
              {detail.disadvantageStatus === "yes" && (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Nhập nội dung..."
                    value={detail.disadvantageDetail}
                    onChange={(e) => {
                      setDetail((d) => ({
                        ...d,
                        disadvantageDetail: e.target.value,
                      }));
                      clearError("disadvantageDetail");
                    }}
                  />
                  <FieldError msg={errors["disadvantageDetail"]} />
                </>
              )}
            </div>
          </div>

          <div className="w-full px-2 mb-4 lg:w-1/2">
            <div className="h-full space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">
                V. Nội dung cần giải quyết
              </p>
              <RadioRow
                value={detail.pendingTaskStatus}
                hasError={!!errors["pendingTaskStatus"]}
                options={[
                  { value: "yes", label: "Có", tone: "danger" },
                  { value: "no", label: "Không", tone: "success" },
                ]}
                onChange={(v) => {
                  setDetail((d) => ({
                    ...d,
                    pendingTaskStatus: v,
                    pendingDetail: v === "no" ? "" : d.pendingDetail,
                  }));
                  clearError("pendingTaskStatus");
                }}
              />
              <FieldError msg={errors["pendingTaskStatus"]} />
              {detail.pendingTaskStatus === "yes" && (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Nhập nội dung..."
                    value={detail.pendingDetail}
                    onChange={(e) => {
                      setDetail((d) => ({
                        ...d,
                        pendingDetail: e.target.value,
                      }));
                      clearError("pendingDetail");
                    }}
                  />
                  <FieldError msg={errors["pendingDetail"]} />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
