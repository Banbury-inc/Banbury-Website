import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

type AssistantUiMessagePart =
  | { type: "text"; text: string }
  | { type: "tool-call"; toolCallId: string; toolName: string; args: any; argsText?: string }
  | { type: "tool-result"; toolCallId: string; result: any };

type AssistantUiMessage = {
  role: "system" | "user" | "assistant";
  content: AssistantUiMessagePart[];
};

const webSearch: any = tool(
  async (input: { query: string }) => {
    const results: Array<{ title: string; url: string; snippet: string }> = [];

    try {
      const mod: any = await import("duck-duck-scrape");
      const search = mod.search || mod.default?.search || mod;
      const ddg: any = await search(input.query, { maxResults: 8 });
      const items: any[] = Array.isArray(ddg?.results) ? ddg.results : Array.isArray(ddg) ? ddg : [];
      for (const r of items) {
        const url = r.url || r.link || r.href;
        const title = r.title || r.name || r.text || "Result";
        const snippet = r.description || r.snippet || r.text || "";
        if (url && title) {
          results.push({ title, url, snippet });
        }
        if (results.length >= 5) break;
      }
    } catch {}

    if (results.length === 0) {
      const url = `https://duckduckgo.com/?q=${encodeURIComponent(input.query)}`;
      results.push({
        title: `Search Results for "${input.query}"`,
        url,
        snippet: `Click to view search results for "${input.query}" on DuckDuckGo.`,
      });
    }

    return JSON.stringify({ results, query: input.query });
  },
  {
    name: "web_search",
    description: "Search the web for real-time information.",
    schema: z.object({ query: z.string() }),
  } as any
);

const anthropicModel = new ChatAnthropic({
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  apiKey: "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",
  temperature: 0.2,
});

const tools = [webSearch];
const modelWithTools = anthropicModel.bindTools(tools as any);

function toLangChainMessages(messages: AssistantUiMessage[]): any[] {
  const lc: any[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      const text = msg.content.filter((p) => p.type === "text").map((p: any) => p.text).join("\n\n");
      if (text) lc.push(new SystemMessage(text));
      continue;
    }

    if (msg.role === "user") {
      const text = msg.content.filter((p) => p.type === "text").map((p: any) => p.text).join("\n\n");
      if (text) lc.push(new HumanMessage(text));
      continue;
    }

    if (msg.role === "assistant") {
      const textParts = msg.content.filter((p) => p.type === "text") as Array<{ type: "text"; text: string }>;
      const toolCalls = msg.content.filter((p) => p.type === "tool-call") as Array<{ type: "tool-call"; toolCallId: string; toolName: string; args: any }>;
      const toolResults = msg.content.filter((p) => p.type === "tool-result") as Array<{ type: "tool-result"; toolCallId: string; result: any }>;

      if (textParts.length > 0 || toolCalls.length > 0) {
        lc.push(
          new AIMessage({
            content: textParts.map((p) => p.text).join("\n\n"),
            tool_calls: toolCalls.map((c) => ({ name: c.toolName, args: c.args, id: c.toolCallId })),
          })
        );
      }

      for (const tr of toolResults) {
        lc.push(new ToolMessage({ content: typeof tr.result === "string" ? tr.result : JSON.stringify(tr.result), tool_call_id: tr.toolCallId }));
      }
    }
  }

  return lc;
}

const SYSTEM_PROMPT =
  "You are a helpful assistant. Answer clearly. Do not repeat the user's message verbatim. When tools return web search results, synthesize a concise summary in 3-5 bullet points and cite the top sources with their titles and URLs. Prefer specific articles over generic search pages. If results are too generic, try refining queries (add site names, time windows, or entity names) rather than apologizing.";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const body = req.body as { messages: AssistantUiMessage[] };
    const lcMessages = toLangChainMessages(body.messages);
    const lastUser = [...lcMessages].reverse().find((m: any) => m._getType && m._getType() === "human") as any;

    // Iterative tool loop (max 5 steps)
    const parts: AssistantUiMessagePart[] = [];
    const messages: any[] = [new SystemMessage(SYSTEM_PROMPT), ...lcMessages];
    const maxSteps = 5;
    const summaryLines: string[] = [];

    for (let step = 0; step < maxSteps; step++) {
      const ai: any = await modelWithTools.invoke(messages);
      const toolCalls = (ai?.tool_calls || ai?.additional_kwargs?.tool_calls) || [];

      if (!toolCalls.length) {
        let finalText = typeof ai.content === "string"
          ? ai.content
          : Array.isArray(ai.content)
            ? ai.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("\n\n")
            : "";

        const lastUserText = typeof lastUser?.content === "string" ? lastUser.content : Array.isArray(lastUser?.content) ? lastUser?.content?.join("\n\n") : "";
        if (finalText && lastUserText && finalText.trim() === lastUserText.trim()) {
          const ai2 = await anthropicModel.invoke([new SystemMessage(SYSTEM_PROMPT + " Never repeat the user's message verbatim; produce a helpful answer."), ...lcMessages]);
          const text2 = typeof (ai2 as any).content === "string"
            ? (ai2 as any).content
            : Array.isArray((ai2 as any).content)
              ? (ai2 as any).content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("\n\n")
              : "";
          if (text2 && text2.trim() !== lastUserText.trim()) {
            finalText = text2;
          } else {
            finalText = "I understand. How can I help further? Provide more context or a specific goal, and I’ll get started.";
          }
        }

        if (finalText) parts.push({ type: "text", text: finalText });
        break;
      }

      // Run tools, append tool-call parts with results, and continue loop
      const toolMessages: any[] = [];
      for (const tc of toolCalls) {
        if (tc.name === "web_search") {
          const toolResult = await webSearch.invoke(tc.args);
          toolMessages.push(new ToolMessage({ content: toolResult, tool_call_id: tc.id }));
          parts.push({
            type: "tool-call",
            toolCallId: tc.id,
            toolName: tc.name,
            args: tc.args,
            argsText: JSON.stringify(tc.args, null, 2),
            result: toolResult,
          } as any);

          // Collect lines for final summarization
          try {
            const parsed = JSON.parse(typeof toolResult === "string" ? toolResult : String(toolResult));
            const query = parsed?.query;
            const results = Array.isArray(parsed?.results) ? parsed.results : [];
            for (const r of results) {
              if (r?.title && r?.url) {
                summaryLines.push(`- ${r.title} (${r.url})${r?.snippet ? ` — ${r.snippet}` : ""}`);
              }
            }
            if (query && results.length === 0) {
              summaryLines.push(`- No direct articles found for "${query}"; consider opening the search page.`);
            }
          } catch {
            /* ignore parse failure */
          }
        } else {
          parts.push({ type: "tool-call", toolCallId: tc.id, toolName: tc.name, args: tc.args, argsText: JSON.stringify(tc.args, null, 2) } as any);
        }
      }

      messages.push(ai as any, ...toolMessages);
    }

    // If we never produced a final text, synthesize one from collected tool results
    const hasFinalText = parts.some((p) => p.type === "text");
    if (!hasFinalText) {
      const lastUserText = typeof lastUser?.content === "string" ? lastUser.content : Array.isArray(lastUser?.content) ? lastUser?.content?.join("\n\n") : "";
      const prompt = summaryLines.length
        ? `Summarize the latest based on these sources in 3-5 concise bullets with short citations:\n${summaryLines.join("\n")}\n\nQuestion: ${lastUserText}`
        : `Provide a short, helpful answer to the user's question: ${lastUserText}`;

      const aiFinal: any = await anthropicModel.invoke([new SystemMessage(SYSTEM_PROMPT), new HumanMessage(prompt)]);
      const finalText = typeof aiFinal.content === "string"
        ? aiFinal.content
        : Array.isArray(aiFinal.content)
          ? aiFinal.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("\n\n")
          : "";
      if (finalText) parts.push({ type: "text", text: finalText });
    }

    res.status(200).json({ content: parts, status: { type: "complete", reason: "stop" } });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "unknown error" });
  }
}


