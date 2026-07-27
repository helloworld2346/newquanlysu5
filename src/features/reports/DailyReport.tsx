import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, UserCheck, UserMinus, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useAuthInfo } from "@/features/auth/queries";
import { useChildrenReports } from "./queries";
import { mapItemToRow, buildDisplayTotals, todayIso, formatNum } from "./utils";
import ReportTableHeader from "./components/ReportTableHeader";
import ReportTableRow from "./components/ReportTableRow";
import ReportTotalRow from "./components/ReportTotalRow";

const EDITABLE = ["Nháp", "Tu_Choi", "Từ_Chối", "Từ chối"];

export default function DailyReport() {
  const navigate = useNavigate();
  const { account } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;

  const [ngay, setNgay] = useState(todayIso());
  const { data: items = [], isLoading } = useChildrenReports(maDonVi, ngay);

  const rows = useMemo(() => items.map(mapItemToRow), [items]);
  const totals = useMemo(() => buildDisplayTotals(rows), [rows]);
  const tyLe = totals.quanSoTong
    ? Math.round((totals.quanSoHienDien / totals.quanSoTong) * 100)
    : 0;

  const stats = [
    {
      label: "Tổng quân số",
      value: formatNum(totals.quanSoTong),
      icon: Users,
      color: "bg-emerald-500",
    },
    {
      label: "Hiện diện",
      value: formatNum(totals.quanSoHienDien),
      icon: UserCheck,
      color: "bg-blue-500",
    },
    {
      label: "Vắng mặt",
      value: formatNum(totals.quanSoVang),
      icon: UserMinus,
      color: "bg-rose-500",
    },
    {
      label: "Tỷ lệ quân số",
      value: `${tyLe}%`,
      icon: Percent,
      color: "bg-violet-500",
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Thống kê quân số trong ngày</h1>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={ngay}
            onChange={(e) => setNgay(e.target.value)}
            className="w-[170px]"
          />
          <Button onClick={() => navigate("/daily-report/create")}>
            <Plus className="mr-2 size-4" /> Thêm báo cáo
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="p-1.5">
            <Card className="h-full shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex min-h-[84px] items-center p-5">
                <div
                  className={`mr-4 grid size-12 shrink-0 place-items-center rounded-xl text-white ${s.color}`}
                >
                  <s.icon className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                  <strong className="block text-2xl font-extrabold leading-none tabular-nums">
                    {s.value}
                  </strong>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table className="min-w-[1600px]">
          <ReportTableHeader />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={21}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={21}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có báo cáo cho ngày này
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rows.map((r) => (
                  <ReportTableRow
                    key={r.idDonBaoCao}
                    row={r}
                    canEdit={EDITABLE.includes(r.status)}
                    onViewDetail={(row) =>
                      navigate(`/daily-report/edit/${row.idDonBaoCao}`)
                    }
                    onEdit={(row) =>
                      navigate(`/daily-report/edit/${row.idDonBaoCao}`)
                    }
                  />
                ))}
                <ReportTotalRow t={totals} />
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
