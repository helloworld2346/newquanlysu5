import { useState, useEffect } from "react";
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
    <div className="flex flex-col gap-1 rounded-xl border bg-card px-4 py-2 text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 text-primary-text" />
        <span className="font-medium">
          {weekday}, {dateStr}
        </span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-primary-text" />
        <span className="font-medium tabular-nums">{timeStr}</span>
      </div>
    </div>
  );
}
