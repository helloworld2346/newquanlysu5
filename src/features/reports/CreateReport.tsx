import { useMemo, useState } from "react";  
import { useNavigate, useParams } from "react-router-dom";  
import { toast } from "sonner";  
import { Trash2, ArrowLeft, Plus, Save } from "lucide-react";  
import { Button } from "@/components/ui/button";  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";  
import { Input } from "@/components/ui/input";  
import { Textarea } from "@/components/ui/textarea";
import {  
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  
} from "@/components/ui/select";  
import { useAuthInfo } from "@/features/auth/queries";  
import { useCreateReport, useUpdateReport } from "./queries";  
import {  
  LY_DO_OPTIONS, CAP_BAC_OPTIONS, EMPTY_VANG, classifyCapBac,  
  todayIso,  
} from "./utils";  
import type {  
  AbsentRow, TrucNguoiInfo, DetailStepData, CreateReportRequest, VangChiTiet,  
} from "@/types/dailyReport";  
  
const genId = () => Math.random().toString(36).slice(2);  
const EMPTY_TRUC: TrucNguoiInfo = {  
  tenNguoitruc: "", capbacNguoitruc: "", chucvuNguoitruc: "", sodienthoai: "",  
};  
const EMPTY_DETAIL: DetailStepData = {  
  securityStatus: "safe", incidentStatus: "no", incidentDetail: "",  
  advantageStatus: "yes", advantageDetail: "", disadvantageStatus: "no",  
  disadvantageDetail: "", pendingTaskStatus: "no", pendingDetail: "",  
};  
  
function TrucSection({  
  title, value, onChange,  
}: {  
  title: string;  
  value: TrucNguoiInfo;  
  onChange: (v: TrucNguoiInfo) => void;  
}) {  
  return (  
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">  
      <div className="lg:col-span-4 text-sm font-semibold">{title}</div>  
      <Input placeholder="Họ và tên *" value={value.tenNguoitruc}  
        onChange={(e) => onChange({ ...value, tenNguoitruc: e.target.value })} />  
      <Select value={value.capbacNguoitruc}  
        onValueChange={(v) => onChange({ ...value, capbacNguoitruc: v })}>  
        <SelectTrigger><SelectValue placeholder="Cấp bậc *" /></SelectTrigger>  
        <SelectContent>  
          {CAP_BAC_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}  
        </SelectContent>  
      </Select>  
      <Input placeholder="Chức vụ *" value={value.chucvuNguoitruc}  
        onChange={(e) => onChange({ ...value, chucvuNguoitruc: e.target.value })} />  
      <Input placeholder="Số điện thoại" value={value.sodienthoai}  
        onChange={(e) => onChange({ ...value, sodienthoai: e.target.value })} />  
    </div>  
  );  
}  

function RadioRow({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={(e) => onChange(e.target.value)}
          />
          {o.label}
        </label>
      ))}
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
  const [tongQuanSo] = useState(donVi?.quanSoTong ?? 0);
  const [trucChiHuy, setTrucChiHuy] = useState<TrucNguoiInfo>({
    ...EMPTY_TRUC,
  });
  const [trucBanTacChien, setTrucBanTacChien] = useState<TrucNguoiInfo>({
    ...EMPTY_TRUC,
  });
  const [absentRows, setAbsentRows] = useState<AbsentRow[]>([]);
  const [detail, setDetail] = useState<DetailStepData>({ ...EMPTY_DETAIL });

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
  const updateRow = (rid: string, field: keyof AbsentRow, v: string) =>
    setAbsentRows((p) =>
      p.map((r) => (r.id === rid ? { ...r, [field]: v } : r)),
    );
  const removeRow = (rid: string) =>
    setAbsentRows((p) => p.filter((r) => r.id !== rid));

  const validate = (): string => {
    const t = trucChiHuy;
    if (
      !t.tenNguoitruc.trim() ||
      !t.capbacNguoitruc.trim() ||
      !t.chucvuNguoitruc.trim()
    )
      return "Điền đầy đủ Trực chỉ huy.";
    const bad = absentRows.findIndex(
      (r) => !r.hoTen.trim() || !r.capBac.trim() || !r.lyDoVang,
    );
    if (bad !== -1)
      return `Dòng ${bad + 1} quân nhân vắng chưa điền đủ thông tin.`;
    if (tongQuanSo > 0 && quanSoVang > tongQuanSo)
      return `Tổng vắng (${quanSoVang}) vượt tổng quân số (${tongQuanSo}).`;
    if (detail.incidentStatus === "yes" && !detail.incidentDetail.trim())
      return "Mục II cần nhập chi tiết khi chọn Có.";
    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return toast.warning(err);

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
          />
          <TrucSection
            title="Trực ban tác chiến / nội vụ"
            value={trucBanTacChien}
            onChange={setTrucBanTacChien}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">
            Danh sách quân nhân vắng mặt
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addRow}>
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
                    <th className="border p-2 text-left">Họ và tên</th>
                    <th className="w-[160px] border p-2 text-left">Cấp bậc</th>
                    <th className="w-[170px] border p-2 text-left">Chức vụ</th>
                    <th className="w-[240px] border p-2 text-left">
                      Lý do vắng
                    </th>
                    <th className="border p-2 text-left">Ghi chú chi tiết</th>
                    <th className="w-[56px] border p-2 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {absentRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-1.5">
                        <Input
                          value={row.hoTen}
                          onChange={(e) =>
                            updateRow(row.id, "hoTen", e.target.value)
                          }
                          placeholder="Nhập họ và tên..."
                        />
                      </td>
                      <td className="border p-1.5">
                        <Select
                          value={row.capBac}
                          onValueChange={(v) => updateRow(row.id, "capBac", v)}
                        >
                          <SelectTrigger>
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
                      </td>
                      <td className="border p-1.5">
                        <Input
                          value={row.chucVu}
                          onChange={(e) =>
                            updateRow(row.id, "chucVu", e.target.value)
                          }
                          placeholder="Nhập chức vụ..."
                        />
                      </td>
                      <td className="border p-1.5">
                        <Select
                          value={row.lyDoVang}
                          onValueChange={(v) =>
                            updateRow(row.id, "lyDoVang", v)
                          }
                        >
                          <SelectTrigger>
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
                      </td>
                      <td className="border p-1.5">
                        <Input
                          value={row.ghiChu}
                          onChange={(e) =>
                            updateRow(row.id, "ghiChu", e.target.value)
                          }
                          placeholder="Nơi công tác, bệnh xá, học viện..."
                        />
                      </td>
                      <td className="border p-1.5 text-center">
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

      {/* Tình hình nhiệm vụ trong ngày (I–IV) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Tình hình nhiệm vụ trong ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* I. An toàn canh phòng */}
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">
              I. Nhiệm vụ các phân đội đóng quân canh phòng
            </p>
            <RadioRow
              name="security"
              value={detail.securityStatus}
              options={[
                { value: "safe", label: "Đảm bảo an toàn" },
                { value: "unsafe", label: "Không đảm bảo an toàn" },
              ]}
              onChange={(v) => setDetail((d) => ({ ...d, securityStatus: v }))}
            />
          </div>

          {/* II. Việc đột xuất */}
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">
              II. Những việc đột xuất xảy ra
            </p>
            <RadioRow
              name="incident"
              value={detail.incidentStatus}
              options={[
                { value: "yes", label: "Có" },
                { value: "no", label: "Không" },
              ]}
              onChange={(v) =>
                setDetail((d) => ({
                  ...d,
                  incidentStatus: v,
                  incidentDetail: v === "no" ? "" : d.incidentDetail,
                }))
              }
            />
            {detail.incidentStatus === "yes" && (
              <Textarea
                rows={3}
                placeholder="Nhập nội dung đột xuất..."
                value={detail.incidentDetail}
                onChange={(e) =>
                  setDetail((d) => ({ ...d, incidentDetail: e.target.value }))
                }
              />
            )}
          </div>

          {/* III. Ưu / khuyết điểm */}
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-semibold">III. Ưu điểm và khuyết điểm</p>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Ưu điểm</label>
              <RadioRow
                name="advantage"
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
                name="disadvantage"
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

          {/* IV. Việc cần tiếp tục giải quyết */}
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-semibold">
              IV. Những việc cần tiếp tục giải quyết
            </p>
            <RadioRow
              name="pending"
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