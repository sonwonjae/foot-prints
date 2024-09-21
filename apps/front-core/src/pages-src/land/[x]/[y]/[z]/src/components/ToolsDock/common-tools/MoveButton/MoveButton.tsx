import { RedoIcon } from "lucide-react";
import { useRouter } from "next/router";
import qs from "query-string";
import { toast } from "sonner";

import { Button } from "@/shad-cn/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shad-cn/components/ui/tooltip";
import { cn } from "@/utils/tailwindcss";

import { useArticleMap } from "../../../../stores/articleMap";
import { useSelectedLand } from "../../../../stores/selectedLand";
import { useUser } from "../../../../stores/user";

function MoveButton() {
  const { landType, location } = useSelectedLand();
  const router = useRouter();

  const queryString = `?${qs.stringify({
    range: router.query.range,
  })}`;

  const { articleMap } = useArticleMap();
  const { user } = useUser();

  const isSameLocation =
    user?.location.x === location.x && user?.location.z === location.z;

  const move = () => {
    if (!articleMap) {
      return;
    }

    if (!user) {
      return;
    }

    if (landType === "fence") {
      user.vibrate();
      toast.error("울타리로는 이동할 수 없습니다.");
      return;
    }

    router.push(
      `/land/${location.x}/0/${location.z}${queryString}`,
      undefined,
      {
        shallow: true,
      },
    );

    articleMap.moveCameraAnimation(location);
    user.move(location, "keyboard");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("cursor-not-allowed")}>
            <Button
              disabled={isSameLocation}
              variant="ghost"
              size="icon"
              className={cn("size-12", "rounded-full")}
              onClick={move}
            >
              <RedoIcon />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>이동하기</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default MoveButton;
