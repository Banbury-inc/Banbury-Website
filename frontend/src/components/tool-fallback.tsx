import { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import ToolCallCard from "./ToolCallCard";
import { Button } from "./ui/button";

export const ToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  argsText,
  result,
}) => {
  return (
    <ToolCallCard
      toolName={toolName}
      label={toolName.replace(/_/g, " ")}
      argsText={argsText}
      result={result}
      icon={<Wrench className="h-4 w-4 text-zinc-500" />}
    />
  );
};
