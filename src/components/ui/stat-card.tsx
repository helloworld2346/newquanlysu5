import * as React from "react";
import { cn } from "@/lib/utils";

export type StatCardTone =
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "violet"
  | "sky";

const TONE_BG: Record<StatCardTone, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
};

export function StatCard({
  tone,
  icon,
  title,
  value,
  className,
}: {
  tone: StatCardTone;
  icon: React.ReactNode;
  title: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[84px] items-center rounded-lg border bg-card p-5 shadow-md transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <span
        className={cn(
          "mr-4 inline-flex size-12 shrink-0 items-center justify-center rounded-xl text-white [&>svg]:size-5",
          TONE_BG[tone],
        )}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <strong className="text-2xl font-extrabold tabular-nums">
          {value}
        </strong>
      </div>
    </div>
  );
}
