import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (isoValue: string) => void;
  max?: string;
  min?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

function displayToIso(text: string): string {
  const parts = text.trim().split(/[-/.]/);
  if (parts.length !== 3) return "";
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);
  if (!d || !m || !y || parts[2].length !== 4) return "";
  const dateObj = new Date(y, m - 1, d);
  if (
    dateObj.getFullYear() !== y ||
    dateObj.getMonth() !== m - 1 ||
    dateObj.getDate() !== d
  )
    return "";
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function isoToDate(iso: string): Date | null {
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function dateToIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function dayValue(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function DateInputVi({
  value,
  onChange,
  max,
  min,
  disabled = false,
  className,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(isoToDisplay(value));
  const [viewDate, setViewDate] = useState<Date>(
    isoToDate(value) ?? new Date(),
  );
  const [prevValue, setPrevValue] = useState(value);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setText(isoToDisplay(value));
    const d = isoToDate(value);
    if (d) setViewDate(d);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const maxDate = useMemo(() => (max ? isoToDate(max) : null), [max]);
  const minDate = useMemo(() => (min ? isoToDate(min) : null), [min]);

  const isDisabledDay = (date: Date): boolean => {
    if (maxDate && dayValue(date) > dayValue(maxDate)) return true;
    if (minDate && dayValue(date) < dayValue(minDate)) return true;
    return false;
  };

  const commitText = () => {
    const iso = displayToIso(text);
    if (iso) {
      const d = isoToDate(iso);
      if (d && isDisabledDay(d)) {
        setText(isoToDisplay(value));
        return;
      }
      onChange(iso);
    } else {
      setText(isoToDisplay(value));
    }
  };

  const handleSelectDay = (date: Date) => {
    if (isDisabledDay(date)) return;
    onChange(dateToIso(date));
    setOpen(false);
  };

  const cells = useMemo<(Date | null)[]>(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const result: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i += 1) result.push(null);
    for (let d = 1; d <= daysInMonth; d += 1)
      result.push(new Date(year, month, d));
    return result;
  }, [viewDate]);

  const goMonth = (delta: number) =>
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="flex h-10 items-center overflow-hidden rounded-md border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="dd-mm-yyyy"
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitText();
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          className="grid h-full place-items-center border-l border-input px-3 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          aria-label="Mở lịch"
          onClick={() => setOpen((v) => !v)}
        >
          <CalendarDays className="size-4" />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 top-11 z-50 w-64 rounded-lg border bg-background p-2.5 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="grid size-7 place-items-center rounded-md border hover:border-ring"
              aria-label="Tháng trước"
              onClick={() => goMonth(-1)}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-bold">
              {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-md border hover:border-ring"
              aria-label="Tháng sau"
              onClick={() => goMonth(1)}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAY_LABELS.map((w) => (
              <span
                key={w}
                className="py-1 text-center text-xs font-bold text-muted-foreground"
              >
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((date, idx) => {
              if (!date) return <span key={`empty-${idx}`} className="h-8" />;
              const iso = dateToIso(date);
              const disabledDay = isDisabledDay(date);
              const selected = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(date)}
                  className={cn(
                    "grid h-8 place-items-center rounded-md text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted",
                    disabledDay &&
                      "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
