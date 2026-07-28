import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { auditLogApi } from "./api";
import type { NhatKySearchPayload, NhatKySearchParams } from "@/types/auditLog";

export function useAuditLogs(
  payload: NhatKySearchPayload,
  params: NhatKySearchParams,
) {
  return useQuery({
    queryKey: ["audit-log", payload, params],
    queryFn: () => auditLogApi.search(payload, params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
