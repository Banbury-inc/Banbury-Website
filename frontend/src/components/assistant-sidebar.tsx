import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import type { FC, PropsWithChildren } from "react";

import { Thread } from "./thread";
import { ClaudeRuntimeProvider } from "../assistant/ClaudeRuntimeProvider";

export const AssistantSidebar: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={75} minSize={50}>
        {children}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <ClaudeRuntimeProvider>
          <Thread />
        </ClaudeRuntimeProvider>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
