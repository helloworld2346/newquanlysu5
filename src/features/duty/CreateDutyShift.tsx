// src/features/duty/CreateDutyShift.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Dices,
  Plus,
  Loader2,
  CircleCheck,
  TriangleAlert,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DateInputVi } from "@/components/ui/date-input-vi";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { getErrorMessage } from "@/lib/errorHandler";
import { dutyApi } from "./api";
import {
  useTrucChiHuy,
  useTrucBanTacChien,
  useCreateCaTruc,
  useUpdateCaTruc,
} from "./queries";
import type { CaTrucDetail, NguoiTrucWithCaTruc } from "@/types/duty";

const PROVINCES = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Điện Biên",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hưng Yên",
  "Huế",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
  "Hồ Chí Minh",
];
function generateMatKhau(): string {
  const a = Math.floor(Math.random() * PROVINCES.length);
  let b = Math.floor(Math.random() * PROVINCES.length);
  while (b === a) b = Math.floor(Math.random() * PROVINCES.length);
  return `${PROVINCES[a]} - ${PROVINCES[b]}`;
}

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateVN(iso: string): string {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function nguoiTrucLabel(p: NguoiTrucWithCaTruc): string {
  return [p.capbacNguoitruc, p.tenNguoitruc, p.chucvuNguoitruc]
    .filter(Boolean)
    .join(" - ");
}

type FieldErrors = {
  chiHuy?: string;
  tacChien?: string;
  ngayTruc?: string;
  matKhau?: string;
};

type DateStatus = "idle" | "checking" | "available" | "existing";

// Tách Row/Person ra module scope để không tạo lại component mỗi lần render
function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

function PreviewPerson({
  label,
  p,
  accent,
  icon,
}: {
  label: string;
  p?: NguoiTrucWithCaTruc | null;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`mb-3 rounded-lg border border-l-4 ${accent} p-3`}>
      <div className="mb-1 flex items-center text-sm font-semibold">
        <span className="mr-2 text-primary">{icon}</span>
        {label}
      </div>
      {p ? (
        <div className="text-sm">
          <p className="font-medium">{p.tenNguoitruc}</p>
          <p className="text-muted-foreground">
            {[p.capbacNguoitruc, p.chucvuNguoitruc].filter(Boolean).join(" · ")}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">— Chưa chọn —</p>
      )}
    </div>
  );
}

function PreviewCard({
  ngaytruc,
  matkhau,
  ghichu,
  chiHuy,
  tacChien,
}: {
  ngaytruc: string;
  matkhau: string;
  ghichu?: string;
  chiHuy?: NguoiTrucWithCaTruc | null;
  tacChien?: NguoiTrucWithCaTruc | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Xem trước</CardTitle>
      </CardHeader>
      <CardContent>
        <PreviewPerson
          label="Trực chỉ huy"
          p={chiHuy}
          accent="border-l-blue-500"
          icon={<ShieldCheck className="size-4" />}
        />
        <PreviewPerson
          label="Trực ban tác chiến"
          p={tacChien}
          accent="border-l-emerald-500"
          icon={<UserCog className="size-4" />}
        />
        <div className="divide-y rounded-lg border">
          <PreviewRow label="Ngày trực" value={formatDateVN(ngaytruc)} />
          <PreviewRow label="Mật khẩu" value={matkhau} />
          <PreviewRow label="Ghi chú" value={ghichu || ""} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreateDutyShift() {
  const { data: chiHuyList = [], isLoading: loadingChiHuy } = useTrucChiHuy();
  const { data: tacChienList = [], isLoading: loadingTacChien } =
    useTrucBanTacChien();
  const createCaTruc = useCreateCaTruc();
  const updateCaTruc = useUpdateCaTruc();

  const today = getToday();

  const [selectedChiHuyId, setSelectedChiHuyId] = useState("");
  const [selectedTacChienId, setSelectedTacChienId] = useState("");
  const [ngayTruc, setNgayTruc] = useState(today);
  const [matKhau, setMatKhau] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const [existingCaTruc, setExistingCaTruc] = useState<CaTrucDetail | null>(
    null,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dateStatus, setDateStatus] = useState<DateStatus>(
    today ? "checking" : "idle",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdCaTruc, setCreatedCaTruc] = useState<CaTrucDetail | null>(null);

  const loadingPersonnel = loadingChiHuy || loadingTacChien;

  // Kiểm tra ngày trực đã có ca trực chưa (debounce 400ms)
  useEffect(() => {
    if (!ngayTruc) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setDateStatus("checking");
      try {
        const ca = await dutyApi.getCaTrucByDate(ngayTruc);
        if (cancelled) return;
        if (ca) {
          setExistingCaTruc(ca);
          setDateStatus("existing");
          setMatKhau(ca.matkhau ?? "");
          if (ca.trucChiHuy?.idNguoitruc)
            setSelectedChiHuyId(ca.trucChiHuy.idNguoitruc);
          if (ca.trucBanTacChien?.idNguoitruc)
            setSelectedTacChienId(ca.trucBanTacChien.idNguoitruc);
          if (ca.ghichu) setGhiChu(ca.ghichu);
        } else {
          setExistingCaTruc(null);
          setDateStatus("available");
        }
      } catch {
        if (!cancelled) {
          setExistingCaTruc(null);
          setDateStatus("available");
        }
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ngayTruc]);

  const selectedChiHuy = useMemo(
    () => chiHuyList.find((p) => p.idNguoitruc === selectedChiHuyId) ?? null,
    [chiHuyList, selectedChiHuyId],
  );
  const selectedTacChien = useMemo(
    () =>
      tacChienList.find((p) => p.idNguoitruc === selectedTacChienId) ?? null,
    [tacChienList, selectedTacChienId],
  );

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!selectedChiHuyId) next.chiHuy = "Vui lòng chọn trực chỉ huy";
    if (!selectedTacChienId) next.tacChien = "Vui lòng chọn trực ban tác chiến";
    if (!ngayTruc) next.ngayTruc = "Vui lòng chọn ngày trực";
    if (!matKhau.trim()) next.matKhau = "Vui lòng nhập mật khẩu ca trực";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitClick = () => {
    if (validate()) setConfirmOpen(true);
  };

  const doSubmit = async () => {
    const payload = {
      ngaytruc: ngayTruc,
      matkhau: matKhau,
      ghichu: ghiChu,
      trucChiHuy: selectedChiHuyId,
      trucBanTacChien: selectedTacChienId,
    };
    try {
      // kiểm tra lại tại thời điểm submit (tránh race)
      let target = existingCaTruc;
      try {
        const ca = await dutyApi.getCaTrucByDate(ngayTruc);
        if (ca) target = ca;
      } catch {
        // 404 → chưa có, sẽ tạo mới
      }

      let idCatruc: string;
      if (target) {
        const res = await updateCaTruc.mutateAsync({
          id: target.idCatruc,
          body: payload,
        });
        idCatruc = res.idCatruc;
        toast.success("Cập nhật ca trực thành công");
      } else {
        const res = await createCaTruc.mutateAsync(payload);
        idCatruc = res.idCatruc;
        toast.success("Tạo ca trực thành công");
      }
      const detail = await dutyApi.getCaTruc(idCatruc);
      setCreatedCaTruc(detail);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReset = () => {
    setCreatedCaTruc(null);
    setExistingCaTruc(null);
    setSelectedChiHuyId("");
    setSelectedTacChienId("");
    const t = getToday();
    setNgayTruc(t);
    setMatKhau("");
    setGhiChu("");
    setErrors({});
    setDateStatus(t ? "checking" : "idle");
  };

  const submitting = createCaTruc.isPending || updateCaTruc.isPending;

  // Màn hình thành công
  if (createdCaTruc) {
    return (
      <div>
        <div className="mb-4 flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <CircleCheck className="mr-2 size-5" />
          <span className="font-medium">Ca trực đã được lưu thành công</span>
        </div>
        <div className="-mx-2 flex flex-wrap">
          <div>
            <PreviewCard
              ngaytruc={createdCaTruc.ngaytruc}
              matkhau={createdCaTruc.matkhau}
              ghichu={createdCaTruc.ghichu ?? undefined}
              chiHuy={createdCaTruc.trucChiHuy as NguoiTrucWithCaTruc | null}
              tacChien={
                createdCaTruc.trucBanTacChien as NguoiTrucWithCaTruc | null
              }
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleReset}>
            <Plus className="mr-1 size-4" /> Tạo ca trực mới
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tạo ca trực</h1>
      </div>

      <div>
        {/* Form — bỏ lg:w-1/2, thêm mb-4 để cách khối preview bên dưới */}
        <div className="mb-4 w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="-mx-2 flex flex-wrap">
                {/* Ngày trực */}
                <div className="mb-4 w-full px-2 sm:w-1/2">
                  <label className="mb-1 block text-sm font-medium">
                    Ngày trực <span className="text-destructive">*</span>
                  </label>
                  <DateInputVi
                    value={ngayTruc}
                    onChange={(v) => {
                      setNgayTruc(v);
                      setErrors((p) => ({ ...p, ngayTruc: undefined }));
                    }}
                  />
                  {errors.ngayTruc ? (
                    <p className="mt-1 flex items-center text-sm text-destructive">
                      <TriangleAlert className="mr-1 size-4" />
                      {errors.ngayTruc}
                    </p>
                  ) : dateStatus === "checking" ? (
                    <p className="mt-1 flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-1 size-4 animate-spin" />
                      Đang kiểm tra ngày...
                    </p>
                  ) : dateStatus === "existing" ? (
                    <p className="mt-1 flex items-center text-sm text-amber-600">
                      <CircleCheck className="mr-1 size-4" />
                      Ngày này đã có ca trực, bạn có thể cập nhật
                    </p>
                  ) : dateStatus === "available" ? (
                    <p className="mt-1 flex items-center text-sm text-emerald-600">
                      <CircleCheck className="mr-1 size-4" />
                      Ngày trống, có thể tạo ca trực
                    </p>
                  ) : null}
                </div>

                {/* Mật khẩu */}
                <div className="mb-4 w-full px-2 sm:w-1/2">
                  <label className="mb-1 block text-sm font-medium">
                    Mật khẩu <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center">
                    <Input
                      className="mr-2"
                      value={matKhau}
                      onChange={(e) => {
                        setMatKhau(e.target.value);
                        setErrors((p) => ({ ...p, matKhau: undefined }));
                      }}
                      placeholder="Nhập mật khẩu ca trực..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setMatKhau(generateMatKhau());
                        setErrors((p) => ({ ...p, matKhau: undefined }));
                      }}
                    >
                      <Dices className="mr-1 size-4" /> Ngẫu nhiên
                    </Button>
                  </div>
                  {errors.matKhau && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.matKhau}
                    </p>
                  )}
                </div>

                {/* Trực chỉ huy */}
                <div className="mb-4 w-full px-2 sm:w-1/2">
                  <label className="mb-1 block text-sm font-medium">
                    Trực chỉ huy <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={selectedChiHuyId}
                    onValueChange={(v) => {
                      setSelectedChiHuyId(v);
                      setErrors((p) => ({ ...p, chiHuy: undefined }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          loadingPersonnel
                            ? "Đang tải..."
                            : "-- Chọn trực chỉ huy --"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {chiHuyList.map((p) => (
                        <SelectItem key={p.idNguoitruc} value={p.idNguoitruc}>
                          {nguoiTrucLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.chiHuy && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.chiHuy}
                    </p>
                  )}
                </div>

                {/* Trực ban tác chiến */}
                <div className="mb-4 w-full px-2 sm:w-1/2">
                  <label className="mb-1 block text-sm font-medium">
                    Trực ban tác chiến{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={selectedTacChienId}
                    onValueChange={(v) => {
                      setSelectedTacChienId(v);
                      setErrors((p) => ({ ...p, tacChien: undefined }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          loadingPersonnel
                            ? "Đang tải..."
                            : "-- Chọn trực ban tác chiến --"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {tacChienList.map((p) => (
                        <SelectItem key={p.idNguoitruc} value={p.idNguoitruc}>
                          {nguoiTrucLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tacChien && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.tacChien}
                    </p>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="mb-4 w-full px-2">
                  <label className="mb-1 block text-sm font-medium">
                    Ghi chú
                  </label>
                  <Input
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitClick}
                  disabled={submitting || dateStatus === "checking"}
                >
                  <Check className="mr-1 size-4" />
                  {submitting
                    ? existingCaTruc
                      ? "Đang cập nhật..."
                      : "Đang tạo..."
                    : existingCaTruc
                      ? "Cập nhật ca trực"
                      : "Tạo ca trực"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="w-full">
          <PreviewCard
            ngaytruc={ngayTruc}
            matkhau={matKhau}
            ghichu={ghiChu}
            chiHuy={selectedChiHuy}
            tacChien={selectedTacChien}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          existingCaTruc ? "Xác nhận cập nhật ca trực" : "Xác nhận tạo ca trực"
        }
        description={`Bạn có chắc chắn muốn ${
          existingCaTruc ? "cập nhật" : "tạo"
        } ca trực ngày ${formatDateVN(ngayTruc)}?`}
        confirmText={existingCaTruc ? "Cập nhật" : "Tạo ca trực"}
        loading={submitting}
        onConfirm={doSubmit}
      />
    </div>
  );
}
