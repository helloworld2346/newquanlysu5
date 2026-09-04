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
    <Card className="overflow-hidden rounded-2xl p-0 shadow-sm">
      {/* Header nền gradient thay cho viền trên */}
      <div className="flex flex-col items-center bg-gradient-to-b from-primary/10 to-transparent px-6 pb-5 pt-7 text-center">
        <div className="mb-3 grid size-20 place-items-center rounded-full bg-primary text-4xl font-bold text-primary-foreground ring-4 ring-primary/15">
          {initial}
        </div>
        <h2 className="text-lg font-bold">{displayName}</h2>
        <span className="mt-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[13px] font-bold text-primary-text">
          {account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
        </span>
      </div>

      {/* Rows kiểu phẳng, không viền trái */}
      <div className="space-y-2 px-5 pb-6">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col gap-0.5 rounded-xl bg-muted/50 px-3.5 py-2.5"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {r.label}
            </span>
            <span className="break-words font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
