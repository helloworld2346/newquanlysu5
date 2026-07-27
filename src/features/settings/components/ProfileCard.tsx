import { UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <UserCog className="size-5 text-primary" />
        <CardTitle className="text-base">Thông tin tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold">{displayName}</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
          </span>
        </div>
        <div className="divide-y rounded-lg border">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
