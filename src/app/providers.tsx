import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/app/queryClient";
import { NotificationProvider } from "@/features/notifications/NotificationProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </NotificationProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
