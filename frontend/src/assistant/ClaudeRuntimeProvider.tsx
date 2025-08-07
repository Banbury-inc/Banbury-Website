import type { FC, PropsWithChildren } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import type {
  ChatModelAdapter,
  ChatModelRunOptions,
  ChatModelRunResult,
} from "@assistant-ui/react";

type AnthropicMessage = {
  role: "user" | "assistant";
  content: Array<{ type: "text"; text: string }>;
};

const buildAnthropicPayload = (options: ChatModelRunOptions) => {
  const anthropicMessages: AnthropicMessage[] = [];
  const systemParts: string[] = [];

  for (const msg of options.messages) {
    if (msg.role === "system") {
      for (const part of msg.content) {
        if (part.type === "text") {
          systemParts.push(part.text);
        }
      }
      continue;
    }

    if (msg.role === "user" || msg.role === "assistant") {
      const textParts: string[] = [];
      for (const part of msg.content) {
        if (part.type === "text") {
          textParts.push(part.text);
        }
      }
      anthropicMessages.push({
        role: msg.role,
        content: [{ type: "text", text: textParts.join("\n\n") }],
      });
    }
  }

  const system = systemParts.length > 0 ? systemParts.join("\n\n") : undefined;
  return { anthropicMessages, system };
};

const anthropicAdapter: ChatModelAdapter = {
  async run(options: ChatModelRunOptions): Promise<ChatModelRunResult> {
    const apiKey =
      "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";
    const model = "claude-sonnet-4-20250514";

    if (!apiKey) {
      return {
        content: [
          { type: "text", text: "Missing ANTHROPIC_API_KEY in localStorage." },
        ],
        status: { type: "incomplete", reason: "other" },
      };
    }

    const { anthropicMessages, system } = buildAnthropicPayload(options);

    const body = {
      model,
      max_tokens: 1024,
      messages: anthropicMessages,
      ...(system ? { system } : {}),
    } as const;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
      signal: options.abortSignal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      return {
        content: [
          {
            type: "text",
            text: errorText || `Anthropic request failed with status ${res.status}.`,
          },
        ],
        status: { type: "incomplete", reason: "error" },
      };
    }

    const data: any = await res.json();
    const text = Array.isArray(data?.content)
      ? data.content
          .filter((c: any) => c?.type === "text")
          .map((c: any) => c.text)
          .join("\n\n")
      : "";

    return {
      content: [{ type: "text", text }],
      status: { type: "complete", reason: "stop" },
    };
  },
};

export const ClaudeRuntimeProvider: FC<PropsWithChildren> = ({ children }) => {
  const runtime = useLocalRuntime(anthropicAdapter);
  return (
    <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
  );
};
