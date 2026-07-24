import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useMinLoading } from "@/shared/hooks/useMinLoading";

export function GlobalLoadingBar() {
  const active = useIsFetching() + useIsMutating() > 0;
  const show = useMinLoading(active, 500);

  if (!show) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-primary" />
  );
}
