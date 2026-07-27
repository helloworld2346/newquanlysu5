import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Users, TriangleAlert, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthInfo } from "@/features/auth/queries";
import { useUpdateUnit } from "@/features/units/queries";
import { normalizeRoleName } from "@/lib/roles";
import type { DonVi } from "@/types/account";

const num = (v: number | null | undefined) => (v ?? 0).toLocaleString("vi-VN");

function NumberField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">
        {label}
      </label>
      <Input
        type="number"
        min={0}
        value={Number.isNaN(value) ? 0 : value}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={(e) => onChange?.(Number(e.target.value) || 0)}
      />
    </div>
  );
}

type Props = {
  donVi: DonVi;
  childUnits?: DonVi[];
};

export default function QuanSoForm({ donVi, childUnits = [] }: Props) {
  const { account } = useAuthInfo();
  const updateUnit = useUpdateUnit();

  const role = normalizeRoleName(account?.vaiTro?.tenVaiTro ?? undefined);
  const isTacChienParent =
    role === "Trực ban tác chiến" &&
    (donVi.capDonVi === "SU_DOAN" || donVi.capDonVi === "TRUNG_DOAN");
  const hasChildren = childUnits.length > 0;
  const isAggregatedOnly = hasChildren && !isTacChienParent;

  const chLabel = donVi.capDonVi === "TRUNG_DOAN" ? "CH/e" : "CH/f";
  const capLabel = donVi.capDonVi === "TRUNG_DOAN" ? "Trung đoàn" : "Sư đoàn";

  const childAgg = useMemo(
    () =>
      childUnits.reduce(
        (acc, c) => ({
          siQuan: acc.siQuan + (c.quanSoSiQuan ?? 0),
          qncn: acc.qncn + (c.quanSoQncn ?? 0),
          hsqBs: acc.hsqBs + (c.quanSoHsqBs ?? 0),
        }),
        { siQuan: 0, qncn: 0, hsqBs: 0 },
      ),
    [childUnits],
  );

  const initSiQuan = isAggregatedOnly
    ? childAgg.siQuan
    : (donVi.quanSoSiQuan ?? 0);
  const initQncn = isAggregatedOnly ? childAgg.qncn : (donVi.quanSoQncn ?? 0);
  const initHsqBs = isAggregatedOnly
    ? childAgg.hsqBs
    : (donVi.quanSoHsqBs ?? 0);

  const [siQuan, setSiQuan] = useState(initSiQuan);
  const [qncn, setQncn] = useState(initQncn);
  const [hsqBs, setHsqBs] = useState(initHsqBs);

  const tong = (siQuan ?? 0) + (qncn ?? 0) + (hsqBs ?? 0);

  const aggSiQuan = (siQuan ?? 0) + childAgg.siQuan;
  const aggQncn = (qncn ?? 0) + childAgg.qncn;
  const aggHsqBs = (hsqBs ?? 0) + childAgg.hsqBs;
  const aggTong = aggSiQuan + aggQncn + aggHsqBs;

  const changed =
    siQuan !== (donVi.quanSoSiQuan ?? 0) ||
    qncn !== (donVi.quanSoQncn ?? 0) ||
    hsqBs !== (donVi.quanSoHsqBs ?? 0);

  const reset = () => {
    setSiQuan(initSiQuan);
    setQncn(initQncn);
    setHsqBs(initHsqBs);
  };

  const disabled = isAggregatedOnly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateUnit.mutateAsync({
        id: donVi.maDonVi,
        data: {
          tenDonvi: donVi.tenDonvi,
          kyhieuDonvi: donVi.kyhieuDonvi,
          capDonVi: donVi.capDonVi ?? "",
          donViCha: donVi.donViCha,
          quanSoTong: tong,
          quanSoSiQuan: siQuan ?? 0,
          quanSoQncn: qncn ?? 0,
          quanSoHsqBs: hsqBs ?? 0,
          createdAt: donVi.createdAt,
          updatedAt: new Date().toISOString(),
          isDeleted: donVi.isDeleted,
          deletedAt: donVi.deletedAt,
        },
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Cập nhật quân số biên chế thành công");
    } catch {
      toast.error("Không thể cập nhật quân số");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            {isTacChienParent
              ? `Quân số biên chế ${chLabel} — ${donVi.tenDonvi}`
              : `Quân số biên chế — ${donVi.tenDonvi}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tong === 0 && !isAggregatedOnly && (
            <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <strong>Chưa nhập quân số biên chế.</strong> Vui lòng nhập quân
                số bên dưới để dùng các tính năng báo cáo.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField
                label="Quân số Sĩ quan"
                value={siQuan}
                onChange={setSiQuan}
                readOnly={disabled}
              />
              <NumberField
                label="Quân số QNCN"
                value={qncn}
                onChange={setQncn}
                readOnly={disabled}
              />
              <NumberField
                label="Quân số HSQ-BS"
                value={hsqBs}
                onChange={setHsqBs}
                readOnly={disabled}
              />
              <div className="flex flex-col justify-end rounded-md bg-slate-700 p-3 text-white">
                <span className="text-xs">Tổng quân số biên chế</span>
                <span className="text-2xl font-extrabold tabular-nums">
                  {num(tong)}
                </span>
              </div>
            </div>

            {!isAggregatedOnly && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  disabled={!changed || updateUnit.isPending}
                >
                  Hoàn tác
                </Button>
                <Button
                  type="submit"
                  disabled={!changed || updateUnit.isPending}
                >
                  {updateUnit.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {isTacChienParent && hasChildren && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4" />
              Quân số cộng dồn toàn {capLabel} (gồm {chLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField label="Quân số Sĩ quan" value={aggSiQuan} readOnly />
              <NumberField label="Quân số QNCN" value={aggQncn} readOnly />
              <NumberField label="Quân số HSQ-BS" value={aggHsqBs} readOnly />
              <div className="flex flex-col justify-end rounded-md bg-slate-700 p-3 text-white">
                <span className="text-xs">Tổng quân số toàn {capLabel}</span>
                <span className="text-2xl font-extrabold tabular-nums">
                  {num(aggTong)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
