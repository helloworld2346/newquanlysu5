import { useMemo } from "react";
import { useAuthInfo } from "@/features/auth/queries";
import { useUnits } from "@/features/units/queries";
import ProfileCard from "./components/ProfileCard";
import PasswordForm from "./components/PasswordForm";
import QuanSoForm from "./components/QuanSoForm";

export default function Settings() {
  const { account } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;
  const { data: units = [] } = useUnits();

  const fullDonVi = useMemo(
    () => units.find((u) => u.maDonVi === maDonVi) ?? null,
    [units, maDonVi],
  );

  const childUnits = useMemo(() => {
    if (!maDonVi) return [];
    return units.filter((u) => {
      if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
      const suffix = u.maDonVi.slice(maDonVi.length + 1);
      return !suffix.includes(".");
    });
  }, [units, maDonVi]);

  return (
    <div className="space-y-4 pb-10">
      <h1 className="text-xl font-semibold">Cài đặt</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {account && <ProfileCard account={account} />}
        <PasswordForm />
      </div>
      {fullDonVi && <QuanSoForm donVi={fullDonVi} childUnits={childUnits} />}
    </div>
  );
}
