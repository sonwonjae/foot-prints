import { FenceIcon } from "lucide-react";

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

function FenceTool() {
  const { landType } = useSelectedLand();

  if (landType !== "fence") {
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
                <FenceIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>울타리</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </TooltipProvider>
  );
}

export default FenceTool;
