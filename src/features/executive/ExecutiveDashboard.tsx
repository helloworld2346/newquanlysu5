import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Gauge as GaugeIcon,
  Trophy,
  BarChart3,
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
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateInputVi } from "@/components/ui/date-input-vi";
import { todayIso, formatNum } from "@/features/reports/utils";
import { useThongKe } from "./queries";
import type { DonViItem } from "./api";
import { ChartTooltip } from "./ChartTooltip";

const PRESENT_COLOR = "#059669";
const ABSENT_COLOR = "#e11d48";

function rateColor(rate: number): string {
  if (rate >= 95) return "#059669";
  if (rate >= 85) return "#d97706";
  return "#e11d48";
}

const CAP_ORDER: Record<string, number> = {
  department: 0,
  regiment: 1,
  battalion: 2,
  company: 3,
};

function inferUnitType(ten: string): keyof typeof CAP_ORDER {
  const t = ten.toLowerCase();
  if (t.includes("trung đoàn")) return "regiment";
  if (t.includes("tiểu đoàn")) return "battalion";
  if (t.includes("đại đội")) return "company";
  return "department";
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

export default function ExecutiveDashboard() {
  const [ngay, setNgay] = useState(todayIso());
  const { data, isLoading } = useThongKe(ngay);

  const tongQuanSo = data?.tongQuanSo ?? 0;
  const tongHienDien = data?.tongHienDien ?? 0;
  const tongVang = data?.tongVang ?? 0;

  const pieData = useMemo(
    () => [
      { name: "Hiện diện", value: tongHienDien, color: PRESENT_COLOR },
      { name: "Vắng", value: tongVang, color: ABSENT_COLOR },
    ],
    [tongHienDien, tongVang],
  );

  const pct = (v: number) =>
    tongQuanSo > 0 ? ((v / tongQuanSo) * 100).toFixed(1) : "0.0";

  const barData = useMemo(() => {
    const list = [...(data?.danhSachDonVi ?? [])].sort((a, b) => {
      const ca = CAP_ORDER[inferUnitType(a.tenDonVi)];
      const cb = CAP_ORDER[inferUnitType(b.tenDonVi)];
      if (ca !== cb) return ca - cb;
      const na = parseInt(a.tenDonVi.match(/\d+/)?.[0] ?? "9999", 10);
      const nb = parseInt(b.tenDonVi.match(/\d+/)?.[0] ?? "9999", 10);
      return na - nb;
    });
    return list.map((u) => ({
      ten: u.tenDonVi,
      "Hiện diện": u.quanSoHienDien,
      Vắng: u.quanSoVang,
    }));
  }, [data]);

  const ranking = useMemo(
    () =>
      [...(data?.danhSachDonVi ?? [])].sort(
        (a, b) => b.tyLeHienDien - a.tyLeHienDien,
      ),
    [data],
  );

  const gaugeRate = data?.tyLeHienDien ?? 0;
  const gaugeData = [{ name: "Hiện diện", value: gaugeRate }];

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tổng hợp trong ngày</h1>
          <p className="text-sm text-muted-foreground">
            Thống kê quân số hiện diện / vắng theo ngày.
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
              icon={<Users />}
              title="Tổng quân số"
              value={formatNum(tongQuanSo)}
            />
            <StatCard
              tone="emerald"
              icon={<UserCheck />}
              title="Hiện diện"
              value={formatNum(tongHienDien)}
            />
            <StatCard
              tone="rose"
              icon={<UserX />}
              title="Vắng"
              value={formatNum(tongVang)}
            />
            <StatCard
              tone="amber"
              icon={<GaugeIcon />}
              title="Tỉ lệ hiện diện"
              value={`${(data?.tyLeHienDien ?? 0).toFixed(1)}%`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Quân số hiện diện / vắng Sư đoàn 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-[260px] w-[260px] rounded-full" />
            ) : tongQuanSo === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                Không có dữ liệu cho ngày này.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-8">
                <div className="relative h-[280px] w-full max-w-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        cornerRadius={8}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <RTooltip
                        content={<ChartTooltip total={tongQuanSo} />}
                        cursor={false}
                        wrapperStyle={{ outline: "none", zIndex: 50 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold tabular-nums">
                      {formatNum(tongQuanSo)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Tổng quân số
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-[240px] space-y-3">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: PRESENT_COLOR }}
                      />
                      <span className="text-sm font-medium">Hiện diện</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-lg font-bold tabular-nums text-emerald-700">
                        {formatNum(tongHienDien)}
                      </span>
                      <span className="text-sm font-semibold text-emerald-700">
                        {pct(tongHienDien)}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded-full"
                        style={{ backgroundColor: ABSENT_COLOR }}
                      />
                      <span className="text-sm font-medium">Vắng</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-lg font-bold tabular-nums text-rose-700">
                        {formatNum(tongVang)}
                      </span>
                      <span className="text-sm font-semibold text-rose-700">
                        {pct(tongVang)}%
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
              <GaugeIcon className="size-4" /> Tỉ lệ hiện diện toàn đơn vị
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="mx-auto h-[220px] w-full rounded-lg" />
            ) : (
              <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={gaugeData}
                    startAngle={210}
                    endAngle={-30}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      tick={false}
                    />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={12}
                      fill={rateColor(gaugeRate)}
                      background={{ fill: "#e2e8f0" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-3xl font-extrabold tabular-nums"
                    style={{ color: rateColor(gaugeRate) }}
                  >
                    {gaugeRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Hiện diện
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" /> Hiện diện / Vắng theo đơn vị
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[360px] w-full rounded-lg" />
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(320, barData.length * 42)}
            >
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                barGap={2}
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
                  dataKey="Hiện diện"
                  fill={PRESENT_COLOR}
                  radius={[0, 4, 4, 0]}
                />
                <Bar dataKey="Vắng" fill={ABSENT_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4" /> Xếp hạng đơn vị theo tỉ lệ hiện diện
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
                  <th className="px-3 py-2 text-center">Tổng</th>
                  <th className="px-3 py-2 text-center">Hiện diện</th>
                  <th className="px-3 py-2 text-center">Vắng</th>
                  <th className="px-3 py-2 text-center">Tỉ lệ HD</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((u: DonViItem, i) => (
                  <tr key={u.tenDonVi} className="border-b hover:bg-muted/50">
                    <td className="px-3 py-2 text-center font-semibold">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium">{u.tenDonVi}</td>
                    <td className="px-3 py-2 text-center tabular-nums">
                      {formatNum(u.quanSoTong)}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-emerald-700">
                      {formatNum(u.quanSoHienDien)}
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-rose-700">
                      {formatNum(u.quanSoVang)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${rateColor(u.tyLeHienDien)}1a`,
                          color: rateColor(u.tyLeHienDien),
                        }}
                      >
                        {u.tyLeHienDien.toFixed(1)}%
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
