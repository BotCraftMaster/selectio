"use client";

import { Button } from "@selectio/ui";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ScreeningResultModal } from "./screening-result-modal";

interface ScreenResponseButtonProps {
  responseId: string;
  accessToken: string | undefined;
  candidateName?: string;
}

export function ScreenResponseButton({
  responseId,
  accessToken,
  candidateName,
}: ScreenResponseButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { submit, run } = useRealtimeTaskTrigger("screen-response", {
    accessToken,
  });

  const handleClick = async () => {
    await submit({ responseId });
  };

  const isRunning = run?.status === "EXECUTING" || run?.status === "QUEUED";

  if (run?.status === "COMPLETED" && run.output && !showModal) {
    setShowModal(true);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={!accessToken || isRunning}
      >
        {isRunning ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-1" />
        )}
        {isRunning ? "Оценка..." : "Оценить"}
      </Button>

      <ScreeningResultModal
        open={showModal}
        onOpenChange={setShowModal}
        result={run?.output?.result || null}
        candidateName={candidateName}
      />
    </>
  );
}
