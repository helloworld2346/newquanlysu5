import { useQuery } from "@tanstack/react-query";
import { politicalDashboardApi } from "./api";

export function useThongKeCtDangCt(ngay: string) {
  return useQuery({
    queryKey: ["thong-ke-ctdangct", ngay],
    queryFn: () => politicalDashboardApi.getThongKeCtDangCt(ngay),
    enabled: !!ngay,
  });
}
