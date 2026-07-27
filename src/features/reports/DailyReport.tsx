import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  UserCheck,
  UserRound,
  UserCog,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
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

  const stats: {
    tone: StatCardTone;
    icon: React.ReactNode;
    title: string;
    value: string;
  }[] = [
    {
      tone: "emerald",
      icon: <Users />,
      title: "Tổng quân số",
      value: formatNum(totals.quanSoTong),
    },
    {
      tone: "blue",
      icon: <UserCheck />,
      title: "Hiện diện",
      value: formatNum(totals.quanSoHienDien),
    },
    {
      tone: "amber",
      icon: <UserRound />,
      title: "Vắng (SQ)",
      value: formatNum(totals.vangSQ),
    },
    {
      tone: "rose",
      icon: <UserCog />,
      title: "Vắng (QNCN)",
      value: formatNum(totals.vangQNCN),
    },
    {
      tone: "violet",
      icon: <UsersRound />,
      title: "Vắng (HSQ-BS)",
      value: formatNum(totals.vangHSQBS),
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

      <div className="-mx-1.5 mb-4 flex flex-wrap">
        {stats.map((s) => (
          <div key={s.title} className="w-full p-1.5 sm:w-1/2 lg:w-1/5">
            <StatCard
              tone={s.tone}
              icon={s.icon}
              title={s.title}
              value={s.value}
              className="h-full"
            />
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
