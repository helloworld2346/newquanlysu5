import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  value: number | string;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      disabled,
      ...props
    },
    ref,
  ) => {
    const current = typeof value === "string" ? Number(value) || 0 : value;

    const clamp = (n: number) => Math.min(max, Math.max(min, n));

    const setValue = (n: number) => {
      if (disabled) return;
      onValueChange(clamp(n));
    };

    return (
      <div
        className={cn(
          "relative flex h-10 w-full items-center rounded-md border border-input bg-background shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onValueChange(min);
              return;
            }
            const n = Number(raw);
            if (!Number.isNaN(n)) onValueChange(clamp(n));
          }}
          className={cn(
            "h-full w-full rounded-md bg-transparent px-3 py-2 pr-9 text-sm",
            "placeholder:text-muted-foreground focus:outline-none",
            "disabled:cursor-not-allowed",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
          {...props}
        />

        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Tăng"
            disabled={disabled || current >= max}
            onClick={() => setValue(current + step)}
            className="grid size-4 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Giảm"
            disabled={disabled || current <= min}
            onClick={() => setValue(current - step)}
            className="grid size-4 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
