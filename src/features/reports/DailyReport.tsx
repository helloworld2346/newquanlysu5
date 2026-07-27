import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  UserCheck,
  UserRound,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
import SearchBar from "@/components/common/SearchBar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DateInputVi } from "@/components/ui/date-input-vi";
import { useAuthInfo } from "@/features/auth/queries";
import { useChildrenReports } from "./queries";
import { useUnits } from "@/features/units/queries";
import {
  mapItemToRow,
  buildDisplayTotals,
  todayIso,
  formatNum,
  createEmptyReportRow,
} from "./utils";
import ReportTableHeader from "./components/ReportTableHeader";
import ReportTableRow from "./components/ReportTableRow";
import ReportTotalRow from "./components/ReportTotalRow";
import type { ReportRow } from "@/types/dailyReport";
import ReportColGroup from "./components/ReportColGroup";

const EDITABLE = ["Nháp", "Tu_Choi", "Từ_Chối", "Từ chối"];

const DRAFT = ["Nháp", "Nhap", "DRAFT"];
const isDraft = (s: string) => DRAFT.includes(s);

const STATUS_FILTERS = [
  { value: "Chua_Nop", label: "Chưa nộp" },
  { value: "Đã_Duyệt", label: "Đã duyệt" },
];

function normalizeStatus(s: string): string {
  if (["Chờ_Duyệt", "Chờ duyệt"].includes(s)) return "Chờ_Duyệt";
  if (["Đã_Duyệt", "Đã duyệt", "Da_Duyet"].includes(s)) return "Đã_Duyệt";
  return s;
}

export default function DailyReport() {
  const navigate = useNavigate();
  const { account } = useAuthInfo();
  const maDonVi = account?.donVi?.maDonVi;

  const [ngay, setNgay] = useState(todayIso());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { data: items = [], isLoading } = useChildrenReports(maDonVi, ngay);
  const { data: units = [] } = useUnits();

  const rows = useMemo(() => {
    const reportByUnit = new Map(
      items.map((it) => {
        const row = mapItemToRow(it);
        return [row.donVi, row] as const;
      }),
    );

    const childUnits = maDonVi
      ? units.filter((u) => {
          if (!u.maDonVi.startsWith(maDonVi + ".")) return false;
          const suffix = u.maDonVi.slice(maDonVi.length + 1);
          return !suffix.includes(".");
        })
      : [];

    if (childUnits.length === 0) {
      return Array.from(reportByUnit.values());
    }

    return childUnits.map(
      (u) =>
        reportByUnit.get(u.maDonVi) ??
        createEmptyReportRow({
          maDonVi: u.maDonVi,
          tenDonVi: u.tenDonvi,
          kyhieuDonVi: u.kyhieuDonvi,
          quanSoTong: u.quanSoTong,
        }),
    );
  }, [items, units, maDonVi]);

  const visibleRows = useMemo(
    () => rows.filter((r) => !isDraft(r.status) || r.donVi === maDonVi),
    [rows, maDonVi],
  );

  const hasFilter = search.trim() !== "" || filterStatus !== "ALL";

  const clearFilter = () => {
    setSearch("");
    setFilterStatus("ALL");
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleRows.filter((r) => {
      if (q) {
        const hit =
          r.tenDonVi.toLowerCase().includes(q) ||
          (r.kyhieuDonVi ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterStatus !== "ALL") {
        if (filterStatus === "Chua_Nop") {
          if (!r.notSubmitted) return false;
        } else {
          if (r.notSubmitted) return false;
          if (normalizeStatus(r.status) !== filterStatus) return false;
        }
      }
      return true;
    });
  }, [visibleRows, search, filterStatus]);

  const totals = useMemo(
    () => buildDisplayTotals(filteredRows),
    [filteredRows],
  );

  const goEditOrCreate = (row: ReportRow) => {
    if (row.notSubmitted) {
      navigate(`/daily-report/create?donVi=${row.donVi}`);
    } else {
      navigate(`/daily-report/edit/${row.idDonBaoCao}`);
    }
  };

  const stats: {
    tone: StatCardTone;
    icon: ReactNode;
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
          <DateInputVi
            value={ngay}
            max={todayIso()}
            onChange={setNgay}
            className="w-[280px]"
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

      <div className="mb-4 flex flex-wrap items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên / ký hiệu đơn vị..."
          className="mb-2 mr-3 w-full sm:w-96"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="mb-2 mr-3 w-56">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {STATUS_FILTERS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="outline" className="mb-2" onClick={clearFilter}>
            <X className="mr-2 size-4" /> Xóa lọc
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-background">
        <Table className="w-full table-fixed min-w-[960px]">
          <ReportColGroup />
          <ReportTableHeader />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={22}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={21}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasFilter
                    ? "Không tìm thấy báo cáo phù hợp"
                    : "Chưa có đơn vị nào"}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredRows.map((r) => (
                  <ReportTableRow
                    key={r.idDonBaoCao}
                    row={r}
                    canEdit={!r.notSubmitted && EDITABLE.includes(r.status)}
                    onViewDetail={goEditOrCreate}
                    onEdit={goEditOrCreate}
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
