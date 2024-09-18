import { PickaxeIcon } from "lucide-react";

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

function WastelandTool() {
  const { landType } = useSelectedLand();

  if (landType !== "wasteland") {
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
                <PickaxeIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>황무지</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </TooltipProvider>
  );
}

export default WastelandTool;
