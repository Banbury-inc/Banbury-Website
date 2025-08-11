import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

type AssistantUiMessagePart =
  | { type: "text"; text: string }
  | { type: "tool-call"; toolCallId: string; toolName: string; args: any; argsText?: string; result?: any };

type AssistantUiMessage = {
  role: "system" | "user" | "assistant";
  content: AssistantUiMessagePart[];
};

const webSearch: any = tool(
  async (input: { query: string }) => {
    type Result = { title: string; url: string; snippet: string };

    const normalizeUrl = (raw: string | undefined): string | null => {
      if (!raw) return null;
      try {
        const u = new URL(raw);
        return u.toString();
      } catch {
        return null;
      }
    };

    const fetchWithTimeout = async (url: string, ms: number): Promise<string | null> => {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), ms);
      try {
        const resp = await fetch(url, { signal: controller.signal, headers: { "user-agent": "Mozilla/5.0" } });
        if (!resp.ok) return null;
        const text = await resp.text();
        return text || null;
      } catch {
        return null;
      } finally {
        clearTimeout(to);
      }
    };

    const extractMeta = (html: string, name: string): string | null => {
      const rx = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
      const m = html.match(rx);
      return m?.[1] || null;
    };

    const extractTitle = (html: string): string | null => {
      const og = extractMeta(html, "og:title");
      if (og) return og;
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return m?.[1] || null;
    };

    const extractDescription = (html: string): string | null => {
      const ogd = extractMeta(html, "og:description") || extractMeta(html, "twitter:description") || extractMeta(html, "description");
      if (ogd) return ogd;
      const p = html.match(/<p[^>]*>(.*?)<\/p>/i);
      if (p?.[1]) return p[1].replace(/<[^>]+>/g, "").trim();
      return null;
    };

    // Prefer Tavily if available for high-quality, content-rich results
    const results: Result[] = [];
    const tavilyKey = process.env.TAVILY_API_KEY || "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";
    if (tavilyKey) {
      try {
        const tavilyResp = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "content-type": "application/json", Authorization: `Bearer ${tavilyKey}` },
          body: JSON.stringify({
            query: input.query,
            search_depth: "advanced",
            include_answer: true,
            include_raw_content: true,
            max_results: 6,
          }),
        });
        if (tavilyResp.ok) {
          const data: any = await tavilyResp.json();
          const items: any[] = Array.isArray(data?.results) ? data.results : [];
          for (const r of items) {
            const url = normalizeUrl(r?.url);
            const title = (r?.title || "Result").toString();
            const snippet = (r?.content || r?.raw_content || "").toString().slice(0, 500);
            if (url) results.push({ title, url, snippet });
            if (results.length >= 5) break;
          }
        }
      } catch {}
    }

    // Fallback to DuckDuckGo + enrichment if Tavily is unavailable or returned nothing
    if (results.length === 0) {
      try {
        const mod: any = await import("duck-duck-scrape");
        const search = mod.search || mod.default?.search || mod;
        const ddg: any = await search(input.query, { maxResults: 8 });
        const items: any[] = Array.isArray(ddg?.results) ? ddg.results : Array.isArray(ddg) ? ddg : [];
        for (const r of items) {
          const url = normalizeUrl(r.url || r.link || r.href);
          if (!url) continue;
          const title = (r.title || r.name || r.text || "Result").toString();
          const snippet = (r.description || r.snippet || r.text || "").toString();
          results.push({ title, url, snippet });
          if (results.length >= 5) break;
        }
      } catch {}
    }

    // Enrich results by fetching page content
    const enrichPromises = results.map(async (r) => {
      const html = await fetchWithTimeout(r.url, 4500);
      if (!html) return r;
      const title = extractTitle(html) || r.title;
      const desc = extractDescription(html) || r.snippet || "";
      return { title, url: r.url, snippet: desc } as Result;
    });
    const enrichedSettled = await Promise.allSettled(enrichPromises);
    const enriched = enrichedSettled
      .map((p) => (p.status === "fulfilled" ? p.value : null))
      .filter((x): x is Result => !!x);

    if (enriched.length === 0) {
      const fallbackUrl = `https://duckduckgo.com/?q=${encodeURIComponent(input.query)}`;
      return JSON.stringify({
        results: [
          { title: `Search Results for "${input.query}"`, url: fallbackUrl, snippet: `Click to view search results for "${input.query}" on DuckDuckGo.` },
        ],
        query: input.query,
      });
    }

    return JSON.stringify({ results: enriched, query: input.query });
  },
  { name: "web_search", description: "Search the web and read page content for summaries", schema: z.object({ query: z.string() }) } as any
);

const anthropicModel = new ChatAnthropic({
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  apiKey: "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",
  temperature: 0.2,
});
const modelWithTools = anthropicModel.bindTools([webSearch] as any);

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
      const textParts = msg.content.filter((p) => p.type === "text").map((p: any) => p.text);
      const toolCalls = msg.content.filter((p) => p.type === "tool-call") as any[];
      if (textParts.length > 0 || toolCalls.length > 0) {
        lc.push(new AIMessage({ content: textParts.join("\n\n"), tool_calls: toolCalls.map((c: any) => ({ name: c.toolName, args: c.args, id: c.toolCallId })) }));
        // For Anthropic: every tool_use must be immediately followed by tool_result
        for (const tc of toolCalls) {
          if (tc.result !== undefined) {
            const content = typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result);
            lc.push(new ToolMessage({ content, tool_call_id: tc.toolCallId }));
          }
        }
      }
    }
  }
  return lc;
}

const SYSTEM_PROMPT =
  "You are a helpful assistant. Stream tokens as they are generated. After tool results, produce a concise 3-5 bullet summary with short citations (title + URL).";

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const send = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const body = req.body as { messages: AssistantUiMessage[] };
    const lcMessages = toLangChainMessages(body.messages);
    const messages: any[] = [new SystemMessage(SYSTEM_PROMPT), ...lcMessages];

    // start assistant message
    send({ type: "message-start", role: "assistant" });

    // Agentic loop: request tools until done, then stream final answer
    const maxSteps = 100;
    for (let step = 0; step < maxSteps; step++) {
      const ai: any = await modelWithTools.invoke(messages);
      const toolCalls = (ai?.tool_calls || ai?.additional_kwargs?.tool_calls) || [];
      if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
        // No tools requested; emit the content from this assistant turn directly
        const textOut = typeof ai?.content === "string"
          ? ai.content
          : Array.isArray(ai?.content)
            ? ai.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("")
            : "";
        if (textOut) {
          send({ type: "text-delta", text: textOut });
        }
        send({ type: "message-end", status: { type: "complete", reason: "stop" } });
        send({ type: "done" });
        res.end();
        return;
      }

      // Execute requested tools and emit tool-call parts as they occur
      const toolMsgs: any[] = [];
      for (const tc of toolCalls) {
        if (tc.name === "web_search") {
          const toolResult = await webSearch.invoke(tc.args);
          send({
            type: "tool-call",
            part: {
              type: "tool-call",
              toolCallId: tc.id,
              toolName: tc.name,
              args: tc.args,
              argsText: JSON.stringify(tc.args, null, 2),
              result: toolResult,
            },
          });
          toolMsgs.push(new ToolMessage({ content: toolResult, tool_call_id: tc.id }));
        } else {
          send({ type: "tool-call", part: { type: "tool-call", toolCallId: tc.id, toolName: tc.name, args: tc.args, argsText: JSON.stringify(tc.args, null, 2) } });
        }
      }

      // Add the AI planning turn and tool results to context for the next iteration
      messages.push(ai as AIMessage, ...toolMsgs);
    }

    // Safety: if loop exits without finalization, end gracefully
    send({ type: "message-end", status: { type: "complete", reason: "stop" } });
    send({ type: "done" });
    res.end();
    res.end();
  } catch (e: any) {
    send({ type: "error", error: e?.message || "unknown error" });
    res.end();
  }
}


