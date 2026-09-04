import { Card } from "@/components/ui/card";
import type { Account } from "@/types/account";

export default function ProfileCard({ account }: { account: Account }) {
  const displayName =
    account.tenTaiKhoan || account.tenDangNhap || "Người dùng";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  const rows = [
    { label: "Tên đăng nhập", value: account.tenDangNhap },
    { label: "Tên tài khoản", value: account.tenTaiKhoan },
    {
      label: "Vai trò",
      value: account.vaiTro?.tenVaiTro || "Chưa phân vai trò",
    },
    { label: "Đơn vị", value: account.donVi?.tenDonvi || "Chưa phân đơn vị" },
  ];

  return (
    <Card className="flex flex-col items-center border-t-4 border-t-primary p-7 text-center">
      <div className="mb-4 grid size-20 place-items-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
        {initial}
      </div>
      <h2 className="mb-2 text-lg font-bold">{displayName}</h2>
      <span className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[13px] font-bold text-primary">
        {account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
      </span>

      <div className="mt-6 w-full space-y-3 border-t pt-4">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col items-start gap-1 rounded-lg border border-l-4 border-l-primary bg-muted/40 px-3.5 py-2.5 text-left"
          >
            <span className="text-[11px] font-bold uppercase tracking-wide text-primary/65">
              {r.label}
            </span>
            <span className="break-words font-bold">{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
