import { useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";

const WEEKDAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

const pad = (n: number) => n.toString().padStart(2, "0");

export default function DateTimeWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekday = WEEKDAYS[now.getDay()];
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className="flex items-stretch gap-3 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary-text">
          <CalendarDays className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs text-muted-foreground">{weekday}</p>
          <p className="text-sm font-semibold tabular-nums">{dateStr}</p>
        </div>
      </div>

      <div className="w-px self-stretch bg-border" />

      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary-text">
          <Clock className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-xs text-muted-foreground">Thời gian</p>
          <p className="text-sm font-semibold tabular-nums">{timeStr}</p>
        </div>
      </div>
    </div>
  );
}
