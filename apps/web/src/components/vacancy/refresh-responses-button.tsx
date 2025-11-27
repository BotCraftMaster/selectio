"use client";

import { Button } from "@selectio/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/react";

interface RefreshResponsesButtonProps {
  vacancyId: string;
}

export function RefreshResponsesButton({
  vacancyId,
}: RefreshResponsesButtonProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/vacancy/refresh-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId }),
      });

      if (!response.ok) {
        throw new Error("Failed to trigger refresh");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Обновление откликов запущено");
      setIsPolling(true);
    },
    onError: () => {
      toast.error("Ошибка запуска обновления");
    },
  });

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      void queryClient.invalidateQueries(
        trpc.vacancy.responses.list.pathFilter()
      );
    }, 5000);

    const timeout = setTimeout(() => {
      setIsPolling(false);
      toast.success("Отклики обновлены");
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isPolling, queryClient, trpc.vacancy.responses.list]);

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const isLoading = refreshMutation.isPending || isPolling;

  return (
    <Button
      onClick={handleRefresh}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Обновление..." : "Обновить отклики"}
    </Button>
  );
}
