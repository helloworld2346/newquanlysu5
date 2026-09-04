import { useMemo } from "react";
import { UserCog } from "lucide-react";
import { useAuthInfo } from "@/features/auth/queries";
import { useUnits, useQuanSoBienChe } from "@/features/units/queries";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileCard from "./components/ProfileCard";
import PasswordForm from "./components/PasswordForm";
import QuanSoForm from "./components/QuanSoForm";
import ThemeCard from "./components/ThemeCard";
import DateTimeWidget from "./components/DateTimeWidget";

function SettingsSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,320px)_1fr]">
      <Skeleton className="h-80 w-full rounded-xl" />
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function Settings() {
  const { account } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;
  const { data: units = [], isLoading } = useUnits();
  const { data: quanSoBienChe } = useQuanSoBienChe(maDonVi);

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
    <div className="mx-auto w-full max-w-[1180px] pb-10">
      <div className="mb-6 flex flex-col items-center gap-4 border-b pb-5 sm:flex-row sm:text-left">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <UserCog className="size-5" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Xem và quản lý thông tin tài khoản của bạn
          </p>
        </div>
        <DateTimeWidget />
      </div>

      {isLoading || !account ? (
        <SettingsSkeleton />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,320px)_1fr]">
          <div className="lg:sticky lg:top-20">
            <ProfileCard account={account} />
          </div>

          <div className="space-y-6">
            {fullDonVi && (
              <QuanSoForm
                donVi={fullDonVi}
                childUnits={childUnits}
                allUnits={units}
                quanSoBienChe={quanSoBienChe ?? null}
              />
            )}
            <PasswordForm />
            <ThemeCard />
          </div>
        </div>
      )}
    </div>
  );
}
