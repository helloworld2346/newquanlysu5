import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { getErrorMessage } from "@/lib/errorHandler";
import { useCreateUnit, useUpdateUnit } from "./queries";
import type { DonVi } from "@/types/account";

const CAP_LABELS: Record<string, string> = {
  SU_DOAN: "Sư đoàn",
  TRUNG_DOAN: "Trung đoàn",
  TIEU_DOAN: "Tiểu đoàn",
  DAI_DOI: "Đại đội",
  PHONG: "Phòng",
};
const CAP_OPTIONS = Object.entries(CAP_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ROOT = "__ROOT__";

const toInt = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
};

type FormState = {
  tenDonvi: string;
  kyhieuDonvi: string;
  capDonVi: string;
  donViCha: string;
  quanSoHsqBs: string;
  quanSoSiQuan: string;
  quanSoQncn: string;
};
const EMPTY_FORM: FormState = {
  tenDonvi: "",
  kyhieuDonvi: "",
  capDonVi: "",
  donViCha: "",
  quanSoHsqBs: "0",
  quanSoSiQuan: "0",
  quanSoQncn: "0",
};

function buildInitialForm(
  editingUnit: DonVi | null,
  units: DonVi[],
): FormState {
  if (!editingUnit) return { ...EMPTY_FORM };
  const parent = units.find((x) => x.tenDonvi === editingUnit.donViCha);
  return {
    tenDonvi: editingUnit.tenDonvi,
    kyhieuDonvi: editingUnit.kyhieuDonvi,
    capDonVi: editingUnit.capDonVi ?? "",
    donViCha: parent ? parent.maDonVi : "",
    quanSoHsqBs: String(editingUnit.quanSoHsqBs),
    quanSoSiQuan: String(editingUnit.quanSoSiQuan),
    quanSoQncn: String(editingUnit.quanSoQncn),
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUnit: DonVi | null;
  units: DonVi[];
  onCreated?: () => void;
};

export default function UnitFormDialog({
  open,
  onOpenChange,
  editingUnit,
  units,
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto">
        <UnitForm
          key={editingUnit?.maDonVi ?? "new"}
          editingUnit={editingUnit}
          units={units}
          onOpenChange={onOpenChange}
          onCreated={onCreated}
        />
      </DialogContent>
    </Dialog>
  );
}

type UnitFormProps = {
  editingUnit: DonVi | null;
  units: DonVi[];
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

function UnitForm({
  editingUnit,
  units,
  onOpenChange,
  onCreated,
}: UnitFormProps) {
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(editingUnit, units),
  );

  const editingId = editingUnit?.maDonVi ?? null;

  // Tổng quân số tính tự động từ 3 ô con
  const quanSoTong =
    toInt(form.quanSoSiQuan) + toInt(form.quanSoQncn) + toInt(form.quanSoHsqBs);

  const parentOptions = units.map((u) => ({
    value: u.maDonVi,
    label: u.tenDonvi,
  }));

  const setField = (k: keyof FormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.tenDonvi.trim()) return toast.error("Vui lòng nhập tên đơn vị");
    if (!form.kyhieuDonvi.trim()) return toast.error("Vui lòng nhập ký hiệu");
    if (!form.capDonVi) return toast.error("Vui lòng chọn cấp đơn vị");

    const base = {
      tenDonvi: form.tenDonvi.trim(),
      kyhieuDonvi: form.kyhieuDonvi.trim(),
      capDonVi: form.capDonVi,
      donViCha: form.donViCha,
      quanSoTong,
      quanSoHsqBs: toInt(form.quanSoHsqBs),
      quanSoSiQuan: toInt(form.quanSoSiQuan),
      quanSoQncn: toInt(form.quanSoQncn),
    };

    try {
      if (editingId && editingUnit) {
        const res = await updateUnit.mutateAsync({
          id: editingId,
          data: {
            ...base,
            createdAt: editingUnit.createdAt,
            updatedAt: new Date().toISOString(),
            isDeleted: editingUnit.isDeleted,
            deletedAt: editingUnit.deletedAt,
          },
        });
        if (!res.success) throw new Error(res.message);
        toast.success("Cập nhật đơn vị thành công");
      } else {
        const res = await createUnit.mutateAsync({ ...base, donViCon: [] });
        if (!res.success) throw new Error(res.message);
        toast.success("Tạo đơn vị thành công");
        onCreated?.();
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể lưu đơn vị"));
    }
  };

  const saving = createUnit.isPending || updateUnit.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editingId ? "Cập nhật đơn vị" : "Thêm đơn vị"}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <Field label="Tên đơn vị *">
          <Input
            value={form.tenDonvi}
            onChange={(e) => setField("tenDonvi", e.target.value)}
          />
        </Field>
        <Field label="Ký hiệu *">
          <Input
            value={form.kyhieuDonvi}
            onChange={(e) => setField("kyhieuDonvi", e.target.value)}
          />
        </Field>
        <Field label="Cấp đơn vị *">
          <Select
            value={form.capDonVi}
            onValueChange={(v) => setField("capDonVi", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn cấp --" />
            </SelectTrigger>
            <SelectContent>
              {CAP_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Đơn vị cha">
          <Select
            value={form.donViCha || ROOT}
            onValueChange={(v) => setField("donViCha", v === ROOT ? "" : v)}
            disabled={!!editingId}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Không có (đơn vị gốc) --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROOT}>-- Không có (đơn vị gốc) --</SelectItem>
              {parentOptions
                .filter((o) => o.value !== editingId)
                .map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Quân số tổng (tự động)">
          <Input
            readOnly
            tabIndex={-1}
            value={quanSoTong}
            className="cursor-default bg-muted text-muted-foreground focus:ring-0 focus:ring-offset-0"
          />
        </Field>
        <Field label="Sĩ quan">
          <NumberInput
            min={0}
            value={form.quanSoSiQuan}
            onValueChange={(n) => setField("quanSoSiQuan", String(n))}
          />
        </Field>
        <Field label="QNCN">
          <NumberInput
            min={0}
            value={form.quanSoQncn}
            onValueChange={(n) => setField("quanSoQncn", String(n))}
          />
        </Field>
        <Field label="HSQ/BS">
          <NumberInput
            min={0}
            value={form.quanSoHsqBs}
            onValueChange={(n) => setField("quanSoHsqBs", String(n))}
          />
        </Field>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={saving}
        >
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo đơn vị"}
        </Button>
      </DialogFooter>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 px-2">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
