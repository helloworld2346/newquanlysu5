import { useMemo, useState } from "react";
import {
  Building2,
  Lightbulb,
  AlertTriangle,
  Layers,
  Filter,
  Gauge as GaugeIcon,
  PieChart as PieIcon,
  BarChart3,
  Trophy,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateInputVi } from "@/components/ui/date-input-vi";
import { todayIso, formatNum } from "@/features/reports/utils";
import { useAuthInfo } from "@/features/auth/queries";
import { ChartTooltip } from "@/features/executive/ChartTooltip";
import { useThongKeCtDangCt } from "./queries";

const ANIM_DURATION = 800;

const PROPOSAL_COLOR = "#2563eb"; // kiến nghị
const INCIDENT_COLOR = "#f97316"; // đột xuất

const LEVEL_META = [
  { key: "Tốt", label: "Tốt", color: "#059669" },
  { key: "Cần chú ý", label: "Cần chú ý", color: "#d97706" },
  { key: "Có vấn đề", label: "Có vấn đề", color: "#e11d48" },
] as const;

type FilterKey = "all" | "department" | "regiment" | "battalion" | "company";

const FILTER_OPTIONS_SD: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Phòng" },
  { key: "regiment", label: "Trung đoàn" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];

const FILTER_OPTIONS_TD: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Ban" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];

function matchFilter(name: string, filter: FilterKey): boolean {
  if (filter === "all") return true;
  const n = name.toLowerCase();
  if (filter === "department") return n.includes("phòng") || n.includes("ban");
  if (filter === "regiment")
    return n.includes("trung đoàn") || n.includes("sư đoàn");
  if (filter === "battalion") return n.includes("tiểu đoàn");
  if (filter === "company") return n.includes("đại đội");
  return true;
}

function statusTone(status: string): string {
  if (status === "Tốt") return "bg-emerald-100 text-emerald-700";
  if (status === "Cần chú ý") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function YAxisTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="#475569">
      {payload?.value}
    </text>
  );
}

export default function PoliticalDashboard() {
  const [ngay, setNgay] = useState(todayIso());
  const { account } = useAuthInfo();
  const capDonVi = account?.donVi?.capDonVi;
  const filterOptions =
    capDonVi === "TRUNG_DOAN" ? FILTER_OPTIONS_TD : FILTER_OPTIONS_SD;

  const [filter, setFilter] = useState<FilterKey>("all");
  const { data, isLoading } = useThongKeCtDangCt(ngay);

  const tongDonVi = data?.tongDonVi ?? 0;
  const donViCoKienNghi = data?.donViCoKienNghi ?? 0;
  const donViCoDotXuat = data?.donViCoDotXuat ?? 0;

  const units = useMemo(
    () =>
      (data?.danhSachDonVi ?? []).map((u) => ({
        id: u.idDonVi,
        name: u.tenDonVi || "Đơn vị trực thuộc",
        status: u.mucDo || "Tốt",
        proposals: Number(u.soKienNghi) || 0,
        incidents: Number(u.soDotXuat) || 0,
        totalIssues: (Number(u.soKienNghi) || 0) + (Number(u.soDotXuat) || 0),
        updateAt: u.updateAt || u.updatedAt || "",
      })),
    [data],
  );

  const visibleUnits = useMemo(
    () => units.filter((u) => matchFilter(u.name, filter)),
    [units, filter],
  );

  const issueRate =
    tongDonVi > 0 ? Math.round((unitsWithIssues(units) / tongDonVi) * 100) : 0;

  const totalProposals = useMemo(
    () => units.reduce((s, u) => s + u.proposals, 0),
    [units],
  );
  const totalIncidents = useMemo(
    () => units.reduce((s, u) => s + u.incidents, 0),
    [units],
  );
  const totalIssueCount = totalProposals + totalIncidents;

  const issueTypeData = useMemo(
    () =>
      [
        { name: "Kiến nghị", value: totalProposals, color: PROPOSAL_COLOR },
        { name: "Đột xuất", value: totalIncidents, color: INCIDENT_COLOR },
      ].filter((x) => x.value > 0),
    [totalProposals, totalIncidents],
  );

  const distData = useMemo(() => {
    let none = 0,
      low = 0,
      mid = 0,
      high = 0;
    for (const u of units) {
      if (u.totalIssues === 0) none++;
      else if (u.totalIssues <= 2) low++;
      else if (u.totalIssues <= 5) mid++;
      else high++;
    }
    return [
      { name: "Không có vấn đề", value: none, color: "#059669" },
      { name: "1–2 vấn đề", value: low, color: "#d97706" },
      { name: "3–5 vấn đề", value: mid, color: "#f97316" },
      { name: "≥6 vấn đề", value: high, color: "#e11d48" },
    ].filter((x) => x.value > 0);
  }, [units]);

  const levelData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of units) counts[u.status] = (counts[u.status] ?? 0) + 1;
    return LEVEL_META.map((l) => ({
      name: l.label,
      value: counts[l.key] ?? 0,
      color: l.color,
    })).filter((x) => x.value > 0);
  }, [units]);

  const topBarData = useMemo(
    () =>
      [...visibleUnits]
        .sort((a, b) => b.totalIssues - a.totalIssues)
        .slice(0, 10)
        .map((u) => ({
          ten: u.name,
          "Kiến nghị": u.proposals,
          "Đột xuất": u.incidents,
        })),
    [visibleUnits],
  );

  const ranking = useMemo(
    () => [...visibleUnits].sort((a, b) => b.totalIssues - a.totalIssues),
    [visibleUnits],
  );

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tổng hợp CTĐ, CTCT</h1>
          <p className="text-sm text-muted-foreground">
            Thống kê hoạt động CTĐ, CTCT theo ngày.
          </p>
        </div>
        <div className="w-56">
          <DateInputVi
            value={ngay}
            onChange={setNgay}
            max={todayIso()}
            align="right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[84px] w-full rounded-lg" />
          ))
        ) : (
          <>
            <StatCard
              tone="blue"
              icon={<Building2 />}
              title="Tổng đơn vị báo cáo"
              value={formatNum(tongDonVi)}
            />
            <StatCard
              tone="emerald"
              icon={<Lightbulb />}
              title="Có kiến nghị, đề xuất"
              value={formatNum(donViCoKienNghi)}
            />
            <StatCard
              tone="amber"
              icon={<AlertTriangle />}
              title="Có vụ việc đột xuất"
              value={formatNum(donViCoDotXuat)}
            />
            <StatCard
              tone="rose"
              icon={<GaugeIcon />}
              title="Tỉ lệ đơn vị có vấn đề"
              value={`${issueRate}%`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieIcon className="size-4" /> Cơ cấu vấn đề theo loại
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-[260px] w-[260px] rounded-full" />
            ) : totalIssueCount === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                Không có vấn đề nào cho ngày này.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8">
                <div className="relative h-[280px] w-full max-w-[340px]">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart key={`issue-${ngay}`}>
                      <Pie
                        data={issueTypeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        cornerRadius={8}
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={true}
                        animationDuration={ANIM_DURATION}
                      >
                        {issueTypeData.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        content={<ChartTooltip total={totalIssueCount} />}
                        cursor={false}
                        wrapperStyle={{ outline: "none", zIndex: 50 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold tabular-nums">
                      {formatNum(totalIssueCount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Vấn đề
                    </span>
                  </div>
                </div>
                <div className="w-full max-w-[240px] space-y-3">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: PROPOSAL_COLOR }}
                      />
                      <span className="text-sm font-medium">Kiến nghị</span>
                      <span className="ml-auto text-lg font-bold tabular-nums text-blue-700">
                        {formatNum(totalProposals)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: INCIDENT_COLOR }}
                      />
                      <span className="text-sm font-medium">Đột xuất</span>
                      <span className="ml-auto text-lg font-bold tabular-nums text-orange-700">
                        {formatNum(totalIncidents)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4" /> Phân bố đơn vị theo số vấn đề
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-[220px] w-full rounded-lg" />
            ) : distData.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Không có dữ liệu cho ngày này.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative h-[200px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart key={`dist-${ngay}`}>
                      <Pie
                        data={distData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        cornerRadius={8}
                        isAnimationActive={true}
                        animationDuration={ANIM_DURATION}
                      >
                        {distData.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        content={<ChartTooltip total={tongDonVi} />}
                        cursor={false}
                        wrapperStyle={{ outline: "none", zIndex: 50 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold tabular-nums">
                      {formatNum(tongDonVi)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Đơn vị
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {distData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span>{d.name}</span>
                      <span className="ml-auto font-semibold tabular-nums">
                        {formatNum(d.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {levelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4" /> Phân bố theo mức độ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-10">
              <div className="relative h-[240px] w-full max-w-[300px]">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart key={`level-${ngay}`}>
                    <Pie
                      data={levelData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      cornerRadius={8}
                      isAnimationActive={true}
                      animationDuration={ANIM_DURATION}
                    >
                      {levelData.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      content={<ChartTooltip total={tongDonVi} />}
                      cursor={false}
                      wrapperStyle={{ outline: "none", zIndex: 50 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid w-full max-w-[280px] grid-cols-1 gap-3">
                {levelData.map((l) => (
                  <div key={l.name} className="rounded-lg border p-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="text-sm font-medium">{l.name}</span>
                      <span className="ml-auto text-sm font-bold tabular-nums">
                        {formatNum(l.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="size-4" /> Lọc:
        </span>
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setFilter(opt.key)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filter === opt.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {visibleUnits.length} đơn vị hiển thị
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" /> Top đơn vị theo số vấn đề
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[320px] w-full rounded-lg" />
          ) : topBarData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Không có dữ liệu cho ngày này.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(320, topBarData.length * 40)}
            >
              <BarChart
                key={`top-${ngay}`}
                data={topBarData}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="ten"
                  width={170}
                  tick={<YAxisTick />}
                />
                <RTooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                />
                <Bar
                  dataKey="Kiến nghị"
                  stackId="issue"
                  fill={PROPOSAL_COLOR}
                  radius={[4, 0, 0, 4]}
                  isAnimationActive={true}
                  animationDuration={ANIM_DURATION}
                />
                <Bar
                  dataKey="Đột xuất"
                  stackId="issue"
                  fill={INCIDENT_COLOR}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={true}
                  animationDuration={ANIM_DURATION}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4" /> Danh sách đơn vị
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 text-center">#</th>
                  <th className="px-3 py-2">Đơn vị</th>
                  <th className="px-3 py-2 text-center">Kiến nghị</th>
                  <th className="px-3 py-2 text-center">Đột xuất</th>
                  <th className="px-3 py-2 text-center">Tổng</th>
                  <th className="px-3 py-2 text-center">Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((u, i) => (
                  <tr key={u.id} className="border-b hover:bg-muted/50">
                    <td className="px-3 py-2 text-center font-semibold">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium">{u.name}</td>
                    <td className="px-3 py-2 text-center tabular-nums text-blue-700">
                      {formatNum(u.proposals)}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-orange-700">
                      {formatNum(u.incidents)}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold tabular-nums">
                      {formatNum(u.totalIssues)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(u.status)}`}
                      >
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      Không có dữ liệu cho ngày này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function unitsWithIssues(units: { totalIssues: number }[]): number {
  return units.filter((u) => u.totalIssues > 0).length;
}
