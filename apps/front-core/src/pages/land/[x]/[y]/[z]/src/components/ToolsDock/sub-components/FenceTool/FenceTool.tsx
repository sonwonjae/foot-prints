import { FenceIcon } from "lucide-react";

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

function FenceTool() {
  const { articleMap } = useArticleMap();
  const { user } = useUser();

  if (!articleMap || !user) {
    /** FIXME: loading view 고안 필요 */
    return null;
  }
  const land = articleMap?.checkCylinder(user.location);

  if (!land || land.landType !== "fence") {
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
            <FenceIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>울타리</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default FenceTool;
