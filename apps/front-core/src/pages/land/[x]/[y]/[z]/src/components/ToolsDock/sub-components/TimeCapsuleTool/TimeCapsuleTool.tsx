import { TreeDeciduousIcon } from "lucide-react";

import { Button } from "@/shad-cn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { cn } from "@/utils/tailwindcss";

import { useArticleMap } from "../../../../stores/articleMap";
import { useUser } from "../../../../stores/user";

function TimeCapsuleTool() {
  const { articleMap } = useArticleMap();
  const { user } = useUser();

  if (!articleMap || !user) {
    /** FIXME: loading view 고안 필요 */
    return null;
  }
  const land = articleMap?.checkCylinder(user.location);

  if (!land || land.landType !== "time-capsule") {
    return null;
  }

  return (
    <TooltipProvider>
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
    </TooltipProvider>
  );
}

export default TimeCapsuleTool;
