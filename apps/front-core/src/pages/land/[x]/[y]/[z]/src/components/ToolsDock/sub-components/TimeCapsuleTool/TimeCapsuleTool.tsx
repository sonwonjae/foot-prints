import { TreeDeciduousIcon } from "lucide-react";

import { Dock, DockIcon } from "@/shad-cn/components/magicui/dock";
import { Button } from "@/shad-cn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../stores/selectedLand";

function TimeCapsuleTool() {
  const { landType } = useSelectedLand();

  if (landType !== "time-capsule") {
    return null;
  }

  return (
    <TooltipProvider>
      <Dock direction="middle" className={cn("bg-white")}>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-12", "rounded-full")}
              >
                <TreeDeciduousIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>타임캡슐 남기기</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </TooltipProvider>
  );
}

export default TimeCapsuleTool;
