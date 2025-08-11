declare module "@assistant-ui/react" {
  import type { ReactNode } from "react";

  export type ChatModelRunOptions = {
    messages: any[];
    abortSignal?: AbortSignal;
  };

  export type ChatModelRunResult = {
    content: any[];
    status: any;
  };

  export type ChatModelAdapter = {
    run(options: ChatModelRunOptions): Promise<ChatModelRunResult>;
  };

  export const AssistantRuntimeProvider: React.FC<{
    runtime: any;
    children?: ReactNode;
  }>;

  export function useLocalRuntime(adapter: ChatModelAdapter): any;
}


