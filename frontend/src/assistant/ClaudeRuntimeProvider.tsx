import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import type { FC, PropsWithChildren } from "react";

export const ClaudeRuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const adapter = {
    async *run(options: { messages: any[]; abortSignal?: AbortSignal }) {
      // Immediately yield a running status to show typing
      const contentParts: any[] = [];
      yield { content: contentParts, status: { type: "running" } } as any;

      const res = await fetch("/api/assistant/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: options.messages }),
        signal: options.abortSignal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        yield { content: [{ type: "text", text: "" }], status: { type: "incomplete", reason: "other" } } as any;
        return;
      }

      let buffer = "";
      let aggregatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          if (!chunk.startsWith("data: ")) continue;
          const json = chunk.slice(6).trim();
          if (!json) continue;
          const evt = JSON.parse(json);
          if (evt.type === "tool-call" && evt.part) {
            // Append tool call in chronological order
            contentParts.push(evt.part);
            yield { content: contentParts, status: { type: "running" } } as any;
          } else if (evt.type === "text-delta" && evt.text) {
            aggregatedText += evt.text;
            const last = contentParts[contentParts.length - 1];
            if (last && (last as any).type === "text") {
              (last as any).text = aggregatedText;
            } else {
              contentParts.push({ type: "text", text: aggregatedText });
            }
            yield { content: contentParts, status: { type: "running" } } as any;
          } else if (evt.type === "message-end") {
            yield { content: contentParts, status: evt.status } as any;
          }
        }
      }
    },
  } as any;
  const runtime = useLocalRuntime(adapter as any);
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
};
