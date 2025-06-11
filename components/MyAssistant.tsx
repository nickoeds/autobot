"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";

import { Thread } from "@/components/assistant-ui/thread";

export function MyAssistant() {
  const runtime = useChatRuntime({
    api: "/api/chat",
    maxSteps: 24,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
