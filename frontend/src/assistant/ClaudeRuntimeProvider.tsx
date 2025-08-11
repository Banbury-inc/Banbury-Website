import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";

import { WebSearchService } from "../services/webSearchService";

import type {
  ChatModelAdapter,
  ChatModelRunOptions,
  ChatModelRunResult,
} from "@assistant-ui/react";
import type { FC, PropsWithChildren } from "react";

type AnthropicMessage = {
  role: "user" | "assistant";
  content: Array<{ type: "text"; text: string } | { type: "tool_use"; id: string; name: string; input: any } | { type: "tool_result"; tool_use_id: string; content: string }>;
};

const webSearchTool = {
  name: "web_search",
  description: "Search the web for real-time information about any topic. Use this tool when you need up-to-date information that might not be available in your training data, or when you need to verify current facts.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search term to look up on the web. Be specific and include relevant keywords for better results.",
      },
    },
    required: ["query"],
  },
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
      const content: AnthropicMessage["content"] = [];
      
      for (const part of msg.content) {
        if (part.type === "text") {
          content.push({ type: "text", text: part.text });
        } else if (part.type === "tool-call") {
          content.push({
            type: "tool_use",
            id: part.toolCallId,
            name: part.toolName,
            input: part.args,
          });
          
          // If the tool call has a result, also add the tool result
          if (part.result !== undefined) {
            content.push({
              type: "tool_result",
              tool_use_id: part.toolCallId,
              content: typeof part.result === "string" ? part.result : JSON.stringify(part.result),
            });
          }
        }
      }
      
      anthropicMessages.push({
        role: msg.role,
        content,
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
      tools: [webSearchTool],
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
    
    // Handle tool calls
    if (data?.content && Array.isArray(data.content)) {
      const content: any[] = [];
      
      for (const item of data.content) {
        if (item.type === "text") {
          content.push({ type: "text", text: item.text });
        } else if (item.type === "tool_use") {
          // Execute the tool
          try {
            let toolResult: any;
            
            if (item.name === "web_search") {
              const searchResult = await WebSearchService.searchWeb(item.input.query);
              toolResult = searchResult;
            } else {
              toolResult = `Unknown tool: ${item.name}`;
            }
            
            content.push({
              type: "tool-call",
              toolCallId: item.id,
              toolName: item.name,
              args: item.input,
              result: toolResult,
              argsText: JSON.stringify(item.input, null, 2),
            });
          } catch (error) {
            content.push({
              type: "tool-call",
              toolCallId: item.id,
              toolName: item.name,
              args: item.input,
              result: `Error executing ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              argsText: JSON.stringify(item.input, null, 2),
              isError: true,
            });
          }
        }
      }
      
      return {
        content,
        status: { type: "complete", reason: "stop" },
      };
    }

    // Fallback for text-only responses
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
