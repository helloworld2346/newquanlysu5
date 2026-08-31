import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
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
import { CAP_BAC_OPTIONS, todayIso } from "@/features/reports/utils";
import { politicalWorkApi } from "./api";
import { useCreatePolitical, useUpdatePolitical } from "./queries";
import type { PoliticalWorkRequest } from "@/types/politicalWork";

const MAX_ACTIVITY = 1500;
const MAX_RESULT = 1000;
const MAX_INCIDENT = 1000;
const MAX_PROPOSAL = 1000;

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

const stringifyTruc = (t: TrucNguoi) => JSON.stringify(t);

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
  disabled,
}: {
  title: string;
  value: TrucNguoi;
  onChange: (v: TrucNguoi) => void;
  prefix: string;
  errors: Errors;
  clearError: (key: string) => void;
  disabled?: boolean;
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
          className={"bg-background " + errClass("ten")}
          placeholder="Nhập họ và tên..."
          value={value.hoTen}
          disabled={disabled}
          onChange={(e) => {
            onChange({ ...value, hoTen: e.target.value });
            clearError(`${prefix}.ten`);
          }}
        />
        <FieldError msg={errors[`${prefix}.ten`]} />
      </div>

      <div className="w-full px-1.5 mb-3 sm:w-1/2 lg:w-1/4">
        <ReqLabel required>Cấp bậc</ReqLabel>
        <Select
          value={value.capBac}
          disabled={disabled}
          onValueChange={(v) => {
            onChange({ ...value, capBac: v });
            clearError(`${prefix}.capBac`);
          }}
        >
          <SelectTrigger className={"bg-background " + errClass("capBac")}>
            <SelectValue placeholder="Chọn cấp bậc" />
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
          className={"bg-background " + errClass("chucVu")}
          placeholder="Nhập chức vụ..."
          value={value.chucVu}
          disabled={disabled}
          onChange={(e) => {
            onChange({ ...value, chucVu: e.target.value });
            clearError(`${prefix}.chucVu`);
          }}
        />
        <FieldError msg={errors[`${prefix}.chucVu`]} />
      </div>

      <div className="w-full px-1.5 mb-3 sm:w-1/2 lg:w-1/4">
        <ReqLabel>Số điện thoại</ReqLabel>
        <Input
          className="bg-background"
          placeholder="Nhập số điện thoại..."
          value={value.soDienThoai}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              ...value,
              soDienThoai: e.target.value.replace(/[^\d+\-\s]/g, ""),
            })
          }
        />
      </div>
    </div>
  );
}

function RadioRow({
  value,
  onChange,
  hasError,
}: {
  value: string; // "yes" | "no" | ""
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const opts = [
    { value: "no", label: "Không có", tone: "success" as const },
    { value: "yes", label: "Có", tone: "danger" as const },
  ];
  return (
    <div className="-mb-2 flex flex-wrap">
      {opts.map((o) => {
        const active = value === o.value;
        const activeCls =
          o.tone === "danger"
            ? "border-rose-200 tone-danger border"
            : "border-emerald-200 tone-success border";
        const idleCls =
          o.tone === "danger"
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
            {active && (
              <span aria-hidden>{o.tone === "danger" ? "✕" : "✓"}</span>
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CreatePoliticalWork() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { account } = useAuthInfo();
  const donVi = account?.donVi;
  const isDaiDoi = donVi?.capDonVi === "DAI_DOI";

  const [searchParams] = useSearchParams();
  const ngayParam = searchParams.get("ngay");
  const isTongHop = searchParams.get("tongHop") === "1" && !isEdit;
  const ngayBaoCao = ngayParam || todayIso();

  const createReport = useCreatePolitical();
  const updateReport = useUpdatePolitical();

  const [ctd, setCtd] = useState<TrucNguoi>({ ...EMPTY_TRUC });
  const [noiVu, setNoiVu] = useState<TrucNguoi>({ ...EMPTY_TRUC });
  const [activity, setActivity] = useState("");
  const [result, setResult] = useState("");
  const [hasIncident, setHasIncident] = useState<string>(""); // "yes" | "no" | ""
  const [incidentDetail, setIncidentDetail] = useState("");
  const [hasProposal, setHasProposal] = useState<string>("");
  const [proposalDetail, setProposalDetail] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const clearError = (key: string) =>
    setErrors((p) => {
      if (!p[key]) return p;
      const n = { ...p };
      delete n[key];
      return n;
    });

  // Load dữ liệu khi edit
  useEffect(() => {
    if (!isEdit || !id) return;
    let ignore = false;
    (async () => {
      try {
        const res = await politicalWorkApi.getById(id);
        const r = res.Result;
        if (!ignore && r) {
          setCtd(parseTruc(r.trucBanCtDangCt));
          setNoiVu(parseTruc(r.trucBanNoiVu));
          setActivity(r.tinhHinh ?? "");
          setResult(r.ketQua ?? "");
          setHasIncident(r.noiDungDotXuat ? "yes" : "no");
          setIncidentDetail(r.noiDungDotXuat ?? "");
          setHasProposal(r.kienNghi ? "yes" : "no");
          setProposalDetail(r.kienNghi ?? "");
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isEdit, id]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!ctd.hoTen.trim()) e["ctd.ten"] = "Vui lòng nhập họ và tên.";
    if (!ctd.capBac.trim()) e["ctd.capBac"] = "Vui lòng chọn cấp bậc.";
    if (!ctd.chucVu.trim()) e["ctd.chucVu"] = "Vui lòng nhập chức vụ.";

    if (!isDaiDoi) {
      if (!noiVu.hoTen.trim()) e["noiVu.ten"] = "Vui lòng nhập họ và tên.";
      if (!noiVu.capBac.trim()) e["noiVu.capBac"] = "Vui lòng chọn cấp bậc.";
      if (!noiVu.chucVu.trim()) e["noiVu.chucVu"] = "Vui lòng nhập chức vụ.";
    }

    if (!activity.trim()) e["activity"] = "Vui lòng nhập tình hình hoạt động.";
    if (!result.trim()) e["result"] = "Vui lòng nhập kết quả.";

    if (!hasIncident) e["hasIncident"] = "Vui lòng chọn.";
    if (hasIncident === "yes" && !incidentDetail.trim())
      e["incidentDetail"] = "Vui lòng nhập nội dung vụ việc đột xuất.";

    if (!hasProposal) e["hasProposal"] = "Vui lòng chọn.";
    if (hasProposal === "yes" && !proposalDetail.trim())
      e["proposalDetail"] = "Vui lòng nhập nội dung kiến nghị, đề xuất.";

    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const payload: PoliticalWorkRequest = {
      tinhHinh: activity,
      ketQua: result,
      noiDungDotXuat: hasIncident === "yes" ? incidentDetail : "",
      kienNghi: hasProposal === "yes" ? proposalDetail : "",
      trucBanCtDangCt: stringifyTruc(ctd),
      trucBanNoiVu: stringifyTruc(isDaiDoi ? EMPTY_TRUC : noiVu),
      thoiGianBaoCao: new Date(`${ngayBaoCao}T12:00:00.000Z`).toISOString(),
      donVi: donVi?.maDonVi ?? "",
      loaiDonBaoCao: isTongHop ? "TONG_HOP" : "DON_VI",
    };

    try {
      if (isEdit) {
        const res = await updateReport.mutateAsync({ id: id!, data: payload });
        if (!res.success) throw new Error(res.message);
        toast.success("Cập nhật báo cáo thành công");
      } else {
        const res = await createReport.mutateAsync(payload);
        if (!res.success) throw new Error(res.message);
        toast.success(
          isTongHop ? "Tổng hợp báo cáo thành công" : "Lưu báo cáo thành công",
        );
      }
      navigate(`/political-work-report?ngay=${ngayBaoCao}`);
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
            onClick={() =>
              navigate(`/political-work-report?ngay=${ngayBaoCao}`)
            }
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEdit
              ? "Cập nhật báo cáo CTĐ, CTCT"
              : isTongHop
                ? "Tổng hợp báo cáo CTĐ, CTCT"
                : "Tạo báo cáo CTĐ, CTCT"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 size-4" />
          {saving ? "Đang lưu..." : "Lưu báo cáo"}
        </Button>
      </div>

      <Card className="border-violet-200 bg-violet-50/70">
        <CardHeader>
          <CardTitle className="text-base text-violet-700">
            Trực công tác đảng, công tác chính trị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrucSection
            title=""
            value={ctd}
            onChange={setCtd}
            prefix="ctd"
            errors={errors}
            clearError={clearError}
          />
        </CardContent>
      </Card>

      {!isDaiDoi && (
        <Card className="border-sky-200 bg-sky-50/70">
          <CardHeader>
            <CardTitle className="text-base text-sky-700">
              Trực ban nội vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrucSection
              title=""
              value={noiVu}
              onChange={setNoiVu}
              prefix="noiVu"
              errors={errors}
              clearError={clearError}
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <CardTitle className="text-base text-emerald-700">
            Tình hình hoạt động CTĐ, CTCT trong ngày{" "}
            <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            maxLength={MAX_ACTIVITY}
            placeholder="Nhập tình hình hoạt động CTĐ, CTCT trong ngày..."
            value={activity}
            className={
              "bg-background " + (errors["activity"] ? "border-red-500" : "")
            }
            onChange={(e) => {
              setActivity(e.target.value);
              clearError("activity");
            }}
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {activity.length}/{MAX_ACTIVITY}
          </div>
          <FieldError msg={errors["activity"]} />
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/70">
        <CardHeader>
          <CardTitle className="text-base text-blue-700">
            Kết quả <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            maxLength={MAX_RESULT}
            placeholder="Nhập kết quả đạt được trong ngày..."
            value={result}
            className={
              "bg-background " + (errors["result"] ? "border-red-500" : "")
            }
            onChange={(e) => {
              setResult(e.target.value);
              clearError("result");
            }}
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {result.length}/{MAX_RESULT}
          </div>
          <FieldError msg={errors["result"]} />
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/70">
        <CardHeader>
          <CardTitle className="text-base text-amber-700">
            Những vụ việc đột xuất xảy ra trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <RadioRow
            value={hasIncident}
            hasError={!!errors["hasIncident"]}
            onChange={(v) => {
              setHasIncident(v);
              if (v === "no") setIncidentDetail("");
              clearError("hasIncident");
            }}
          />
          <FieldError msg={errors["hasIncident"]} />
          {hasIncident === "yes" && (
            <>
              <Textarea
                rows={4}
                maxLength={MAX_INCIDENT}
                placeholder="Nhập nội dung chi tiết các vụ việc đột xuất..."
                value={incidentDetail}
                className={
                  "bg-background " +
                  (errors["incidentDetail"] ? "border-red-500" : "")
                }
                onChange={(e) => {
                  setIncidentDetail(e.target.value);
                  clearError("incidentDetail");
                }}
              />
              <FieldError msg={errors["incidentDetail"]} />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-rose-200 bg-rose-50/70">
        <CardHeader>
          <CardTitle className="text-base text-rose-700">
            Kiến nghị, đề xuất
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <RadioRow
            value={hasProposal}
            hasError={!!errors["hasProposal"]}
            onChange={(v) => {
              setHasProposal(v);
              if (v === "no") setProposalDetail("");
              clearError("hasProposal");
            }}
          />
          <FieldError msg={errors["hasProposal"]} />
          {hasProposal === "yes" && (
            <>
              <Textarea
                rows={4}
                maxLength={MAX_PROPOSAL}
                placeholder="Nhập các kiến nghị, đề xuất từ đơn vị..."
                value={proposalDetail}
                className={
                  "bg-background " +
                  (errors["proposalDetail"] ? "border-red-500" : "")
                }
                onChange={(e) => {
                  setProposalDetail(e.target.value);
                  clearError("proposalDetail");
                }}
              />
              <FieldError msg={errors["proposalDetail"]} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
