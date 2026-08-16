import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Users, TriangleAlert, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAuthInfo } from "@/features/auth/queries";
import { useUpdateUnit } from "@/features/units/queries";
import { normalizeRoleName } from "@/lib/roles";
import type { DonVi, QuanSoBienCheResult } from "@/types/account";

const num = (v: number | null | undefined) => (v ?? 0).toLocaleString("vi-VN");

const COMMAND_KYHIEU = ["CH/e", "CH/f"];
const EXPAND_CAPS = ["SU_DOAN", "TRUNG_DOAN"];

type Agg = { siQuan: number; qncn: number; hsqBs: number };

function getDirectChildren(maDonVi: string, all: DonVi[]): DonVi[] {
  return all.filter((u) => {
    if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
    const suffix = u.maDonVi.slice(maDonVi.length + 1);
    return !suffix.includes(".");
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
    <div className="w-full px-2 mb-3 sm:w-1/2 lg:w-1/4">
      <label className="mb-1 block text-sm text-muted-foreground truncate">
        {label}
      </label>
      <NumberInput
        min={0}
        value={Number.isNaN(value) ? 0 : value}
        onValueChange={(n) => onChange?.(n)}
        disabled={readOnly}
      />
    </div>
  );
}

type Props = {
  donVi: DonVi;
  childUnits?: DonVi[];
  allUnits?: DonVi[];
  quanSoBienChe?: QuanSoBienCheResult | null;
};

export default function QuanSoForm({
  donVi,
  childUnits = [],
  allUnits = [],
  quanSoBienChe = null,
}: Props) {
  const { account } = useAuthInfo();
  const updateUnit = useUpdateUnit();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const role = normalizeRoleName(account?.vaiTro?.tenVaiTro ?? undefined);
  const isTacChienParent =
    role === "Trực ban tác chiến" &&
    (donVi.capDonVi === "SU_DOAN" || donVi.capDonVi === "TRUNG_DOAN");
  const hasChildren = childUnits.length > 0;
  const isAggregatedOnly = hasChildren && !isTacChienParent;

  const chLabel = donVi.capDonVi === "TRUNG_DOAN" ? "CH/e" : "CH/f";
  const capLabel = donVi.capDonVi === "TRUNG_DOAN" ? "Trung đoàn" : "Sư đoàn";

  const childAgg = useMemo<Agg>(() => {
    const base = allUnits.length > 0 ? allUnits : childUnits;
    return childUnits
      .filter((u) => !COMMAND_KYHIEU.includes(u.kyhieuDonvi))
      .reduce<Agg>(
        (acc, c) => {
          const t = unitFullAgg(c, base);
          return {
            siQuan: acc.siQuan + t.siQuan,
            qncn: acc.qncn + t.qncn,
            hsqBs: acc.hsqBs + t.hsqBs,
          };
        },
        { siQuan: 0, qncn: 0, hsqBs: 0 },
      );
  }, [childUnits, allUnits]);

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

  const localSiQuan = (siQuan ?? 0) + childAgg.siQuan;
  const localQncn = (qncn ?? 0) + childAgg.qncn;
  const localHsqBs = (hsqBs ?? 0) + childAgg.hsqBs;

  const aggSiQuan = Math.max(localSiQuan, quanSoBienChe?.quanSoSiQuan ?? 0);
  const aggQncn = Math.max(localQncn, quanSoBienChe?.quanSoQncn ?? 0);
  const aggHsqBs = Math.max(localHsqBs, quanSoBienChe?.quanSoHsqBs ?? 0);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changed || updateUnit.isPending) return;
    setConfirmOpen(true);
  };

  const doSave = async () => {
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
          <CardTitle className="flex items-center text-base">
            <Users className="mr-2 size-4" />
            {isTacChienParent
              ? `Quân số biên chế ${chLabel} — ${donVi.tenDonvi}`
              : `Quân số biên chế — ${donVi.tenDonvi}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tong === 0 && !isAggregatedOnly && (
            <div className="mb-3 flex items-start rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <TriangleAlert className="mr-2 mt-0.5 size-4 shrink-0" />
              <div>
                <strong>Chưa nhập quân số biên chế.</strong> Vui lòng nhập quân
                số bên dưới để dùng các tính năng báo cáo.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap -mx-2">
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
              <div className="w-full px-2 mb-3 sm:w-1/2 lg:w-1/4">
                <label className="mb-1 block text-sm text-muted-foreground truncate">
                  Tổng biên chế
                </label>
                <div className="flex items-center rounded-md bg-primary px-3 text-primary-foreground h-10">
                  <span className="text-sm font-bold tabular-nums">
                    {num(tong)}
                  </span>
                </div>
              </div>
            </div>

            {!isAggregatedOnly && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  disabled={!changed || updateUnit.isPending}
                  className="mr-2"
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
            <CardTitle className="flex items-center text-base">
              <Layers className="mr-2 size-4" />
              Quân số toàn {capLabel} (gồm {chLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap -mx-2">
              <NumberField label="Quân số Sĩ quan" value={aggSiQuan} readOnly />
              <NumberField label="Quân số QNCN" value={aggQncn} readOnly />
              <NumberField label="Quân số HSQ-BS" value={aggHsqBs} readOnly />
              <div className="w-full px-2 mb-3 sm:w-1/2 lg:w-1/4">
                <label className="mb-1 block text-sm text-muted-foreground truncate">
                  Tổng toàn {capLabel}
                </label>
                <div className="flex items-center rounded-md bg-primary px-3 text-primary-foreground h-10">
                  <span className="text-sm font-bold tabular-nums">
                    {num(aggTong)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cập nhật quân số biên chế"
        description={`Bạn có chắc muốn lưu quân số biên chế mới cho "${donVi.tenDonvi}"? Tổng biên chế: ${num(tong)}.`}
        confirmText="Lưu thay đổi"
        loading={updateUnit.isPending}
        onConfirm={doSave}
      />
    </>
  );
}
