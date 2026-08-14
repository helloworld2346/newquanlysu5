import type { TooltipProps } from "recharts";
import { formatNum } from "@/features/reports/utils";

type Props = TooltipProps<number, string> & {
  total?: number;
};

export function ChartTooltip({ active, payload, label, total }: Props) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      {label != null && label !== "" && (
        <div className="mb-1.5 font-semibold text-foreground">{label}</div>
      )}
      <div className="space-y-1">
        {payload.map((entry) => {
          const value = Number(entry.value ?? 0);
          const color =
            ((entry.payload as { color?: string })?.color as string) ??
            (entry.color as string) ??
            "#64748b";
          const pctText =
            total && total > 0
              ? ` (${((value / total) * 100).toFixed(1)}%)`
              : "";
          return (
            <div key={String(entry.name)} className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span
                className="ml-auto pl-3 font-semibold tabular-nums"
                style={{ color }}
              >
                {formatNum(value)}
                {pctText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
