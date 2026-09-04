import { Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/shared/hooks/useTheme";

export default function ThemeCard() {
  const { dark, toggle } = useTheme();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row items-center border-b">
        {dark ? (
          <Moon className="mr-2 size-5 text-primary-text" />
        ) : (
          <Sun className="mr-2 size-5 text-primary-text" />
        )}
        <CardTitle className="text-base text-primary-text">Giao diện</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {dark ? "Giao diện tối" : "Giao diện sáng"}
            </span>
            <span className="text-sm text-muted-foreground">
              Tùy chỉnh màu nền sáng/tối cho toàn bộ ứng dụng
            </span>
          </div>

          <div className="flex gap-2 rounded-full border bg-muted p-1">
            <button
              type="button"
              onClick={() => dark && toggle()}
              aria-pressed={!dark}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                !dark
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary-text"
              }`}
            >
              <Sun className="size-4" />
              <span>Sáng</span>
            </button>
            <button
              type="button"
              onClick={() => !dark && toggle()}
              aria-pressed={dark}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                dark
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary-text"
              }`}
            >
              <Moon className="size-4" />
              <span>Tối</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
