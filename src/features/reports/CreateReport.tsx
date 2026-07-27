import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, ArrowLeft, Plus, Save, AlertTriangle } from "lucide-react";
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
} from "@/types/dailyReport";

const genId = () => Math.random().toString(36).slice(2);
const EMPTY_TRUC: TrucNguoiInfo = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};
const EMPTY_DETAIL: DetailStepData = {
  securityStatus: "safe",
  incidentStatus: "no",
  incidentDetail: "",
  advantageStatus: "yes",
  advantageDetail: "",
  disadvantageStatus: "no",
  disadvantageDetail: "",
  pendingTaskStatus: "no",
  pendingDetail: "",
};

type Errors = Record<string, string>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertTriangle className="size-3.5 shrink-0" />
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
    <label className="mb-1 block text-xs text-muted-foreground">
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-4 text-sm font-semibold">{title}</div>
      <div>
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
      <div>
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
      <div>
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
      <div>
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
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              "select-none rounded-lg border px-4 py-1.5 text-sm font-semibold transition-colors " +
              (active
                ? "border-slate-700 bg-slate-700 text-white"
                : "border-input bg-background text-foreground hover:border-slate-700 hover:text-slate-700")
            }
          >
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

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();

  const [ngayBaoCao] = useState(todayIso());
  const tongQuanSo = donVi?.quanSoTong ?? 0;
  const [trucChiHuy, setTrucChiHuy] = useState<TrucNguoiInfo>({
    ...EMPTY_TRUC,
  });
  const [trucBanTacChien, setTrucBanTacChien] = useState<TrucNguoiInfo>({
    ...EMPTY_TRUC,
  });
  const [absentRows, setAbsentRows] = useState<AbsentRow[]>([]);
  const [detail, setDetail] = useState<DetailStepData>({ ...EMPTY_DETAIL });

  const [errors, setErrors] = useState<Errors>({});
  const clearError = (key: string) =>
    setErrors((p) => {
      if (!p[key]) return p;
      const n = { ...p };
      delete n[key];
      return n;
    });

  const quanSoVang = absentRows.length;
  const quanSoHienDien = Math.max(0, tongQuanSo - quanSoVang);

  const warnings = useMemo(() => {
    const by = { siQuan: 0, qncn: 0, hsqBs: 0 };
    absentRows.forEach(
      (r) => r.capBac.trim() && by[classifyCapBac(r.capBac)]++,
    );
    const w: string[] = [];
    if ((donVi?.quanSoSiQuan ?? 0) > 0 && by.siQuan > donVi!.quanSoSiQuan)
      w.push(
        `Vắng Sĩ quan (${by.siQuan}) vượt biên chế (${donVi!.quanSoSiQuan}).`,
      );
    if ((donVi?.quanSoQncn ?? 0) > 0 && by.qncn > donVi!.quanSoQncn)
      w.push(`Vắng QNCN (${by.qncn}) vượt biên chế (${donVi!.quanSoQncn}).`);
    if ((donVi?.quanSoHsqBs ?? 0) > 0 && by.hsqBs > donVi!.quanSoHsqBs)
      w.push(
        `Vắng HSQ-BS (${by.hsqBs}) vượt biên chế (${donVi!.quanSoHsqBs}).`,
      );
    return w;
  }, [absentRows, donVi]);

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

    if (detail.incidentStatus === "yes" && !detail.incidentDetail.trim())
      e["incidentDetail"] = "Nhập chi tiết khi chọn Có.";

    return e;
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
      trucBanTacChien: JSON.stringify(trucBanTacChien),
      tinhHinhHoatDong: JSON.stringify(detail),
      loaiDonBaoCao: "DON_VI",
    };

    try {
      if (isEdit) {
        const res = await updateReport.mutateAsync({ id: id!, data: payload });
        if (!res.success) throw new Error(res.message);
        toast.success("Cập nhật báo cáo thành công");
      } else {
        const res = await createReport.mutateAsync(payload);
        if (!res.success) throw new Error(res.message);
        toast.success("Lưu báo cáo thành công");
      }
      navigate("/daily-report");
    } catch {
      toast.error("Không thể lưu báo cáo");
    }
  };

  const saving = createReport.isPending || updateReport.isPending;

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/daily-report")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEdit
              ? "Cập nhật báo cáo quân số"
              : "Tạo báo cáo quân số hằng ngày"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 size-4" />{" "}
          {saving ? "Đang lưu..." : "Lưu báo cáo"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs text-muted-foreground">
              Ngày báo cáo
            </label>
            <Input type="date" value={ngayBaoCao} disabled />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Tổng quân số biên chế
            </label>
            <Input value={tongQuanSo} disabled />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Quân số hiện diện
            </label>
            <Input value={quanSoHienDien} disabled />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tổng vắng</label>
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
          <TrucSection
            title="Trực ban tác chiến / nội vụ"
            value={trucBanTacChien}
            onChange={setTrucBanTacChien}
            prefix="tacChien"
            errors={errors}
            clearError={clearError}
          />
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
            className="bg-slate-700 text-white hover:bg-slate-800"
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
                  {absentRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="border p-2 text-center align-top pt-3.5">
                        {index + 1}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Tình hình nhiệm vụ trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">
              I. Nhiệm vụ các phân đội đóng quân canh phòng
            </p>
            <RadioRow
              value={detail.securityStatus}
              options={[
                { value: "safe", label: "Đảm bảo an toàn" },
                { value: "unsafe", label: "Không đảm bảo an toàn" },
              ]}
              onChange={(v) => setDetail((d) => ({ ...d, securityStatus: v }))}
            />
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">
              II. Những việc đột xuất xảy ra
            </p>
            <RadioRow
              value={detail.incidentStatus}
              options={[
                { value: "yes", label: "Có" },
                { value: "no", label: "Không" },
              ]}
              onChange={(v) => {
                setDetail((d) => ({
                  ...d,
                  incidentStatus: v,
                  incidentDetail: v === "no" ? "" : d.incidentDetail,
                }));
                if (v === "no") clearError("incidentDetail");
              }}
            />
            {detail.incidentStatus === "yes" && (
              <>
                <Textarea
                  rows={3}
                  className={
                    errors["incidentDetail"]
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  placeholder="Nhập nội dung đột xuất..."
                  value={detail.incidentDetail}
                  onChange={(e) => {
                    setDetail((d) => ({
                      ...d,
                      incidentDetail: e.target.value,
                    }));
                    clearError("incidentDetail");
                  }}
                />
                <FieldError msg={errors["incidentDetail"]} />
              </>
            )}
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-semibold">III. Ưu điểm và khuyết điểm</p>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Ưu điểm</label>
              <RadioRow
                value={detail.advantageStatus}
                options={[
                  { value: "yes", label: "Có" },
                  { value: "no", label: "Không" },
                ]}
                onChange={(v) =>
                  setDetail((d) => ({ ...d, advantageStatus: v }))
                }
              />
              <Textarea
                rows={2}
                placeholder="Nhập ưu điểm..."
                value={detail.advantageDetail}
                onChange={(e) =>
                  setDetail((d) => ({ ...d, advantageDetail: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Khuyết điểm
              </label>
              <RadioRow
                value={detail.disadvantageStatus}
                options={[
                  { value: "yes", label: "Có" },
                  { value: "no", label: "Không" },
                ]}
                onChange={(v) =>
                  setDetail((d) => ({
                    ...d,
                    disadvantageStatus: v,
                    disadvantageDetail: v === "no" ? "" : d.disadvantageDetail,
                  }))
                }
              />
              {detail.disadvantageStatus === "yes" && (
                <Textarea
                  rows={2}
                  placeholder="Nhập khuyết điểm..."
                  value={detail.disadvantageDetail}
                  onChange={(e) =>
                    setDetail((d) => ({
                      ...d,
                      disadvantageDetail: e.target.value,
                    }))
                  }
                />
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">
              IV. Những việc cần tiếp tục giải quyết
            </p>
            <RadioRow
              value={detail.pendingTaskStatus}
              options={[
                { value: "yes", label: "Có" },
                { value: "no", label: "Không" },
              ]}
              onChange={(v) =>
                setDetail((d) => ({
                  ...d,
                  pendingTaskStatus: v,
                  pendingDetail: v === "no" ? "" : d.pendingDetail,
                }))
              }
            />
            {detail.pendingTaskStatus === "yes" && (
              <Textarea
                rows={3}
                placeholder="Nhập nội dung..."
                value={detail.pendingDetail}
                onChange={(e) =>
                  setDetail((d) => ({ ...d, pendingDetail: e.target.value }))
                }
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
