import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FootprintsIcon,
  FlagTriangleRightIcon,
  LoaderIcon,
  DoorOpenIcon,
} from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@/shad-cn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { apiAxios, makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

function LandInformationPanel() {
  const router = useRouter();

  const locationQuery = makeGetQueryOptions({
    url: `/api/locations/${Number(router.query.x)}/${Number(router.query.z)}`,
  });

  const { data: location, isLoading: isLocationLoading } = useQuery(
    locationQuery.getQueryOptionsInClient(),
  );

  const { mutateAsync: pioneerLocation } = useMutation({
    mutationFn: async () => {
      await apiAxios.post("/api/locations", {
        x: Number(router.query.x),
        z: Number(router.query.z),
      });
    },
  });
  const moveUnit = async () => {
    if (isLocationLoading) {
      return;
    }

    if (location?.type === "other-user-location") {
      console.log("click to read");
      router.push(`${window.location.pathname}/read`);
      return;
    }

    if (location?.type === "empty") {
      await pioneerLocation();
    }
    console.log("click to write");
    router.push(`${window.location.pathname}/write`);
  };

  return (
    <div
      className={cn(
        "absolute",
        "top-4",
        // "bottom-4",
        "right-4",
        "flex",
        "flex-col",
        "gap-2",
        "w-fit",
        "h-fit",
        "p-2",
        "rounded-xl",
        "border-2",
        "border-solid",
        "border-slate-200",
        "shadow-inner",
        "bg-white/70",
        "backdrop-blur-sm",
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
      }}
    >
      <TooltipProvider>
        {/* FIXME: category가 있을 경우에만 표시하도록 수정 필요 */}
        {/* <Button>[category] 방문하기</Button> */}
        {/* TODO: loading ui 추가 - to shadcn */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={moveUnit}
              disabled={isLocationLoading}
              className={cn("relative")}
            >
              {isLocationLoading && <LoaderIcon className="animate-spin" />}
              {!isLocationLoading && location?.type === "mine-location" && (
                <FootprintsIcon />
              )}
              {!isLocationLoading &&
                location?.type === "other-user-location" && <DoorOpenIcon />}
              {!isLocationLoading && location?.type === "empty" && (
                <FlagTriangleRightIcon />
              )}
              {((!isLocationLoading && location?.type === "mine-location") ||
                (!isLocationLoading && location?.type === "empty")) && (
                <span
                  className={cn(
                    "animate-ping",
                    "absolute",
                    "top-0",
                    "left-0",
                    "h-2",
                    "w-2",
                    "rounded-full",
                    "bg-sky-400",
                    "opacity-75",
                  )}
                ></span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isLocationLoading && "땅 탐색 중..."}
            {!isLocationLoading &&
              location?.type === "mine-location" &&
              "마저 발자취 남기기"}
            {!isLocationLoading &&
              location?.type === "other-user-location" &&
              "놀러가기"}
            {!isLocationLoading && location?.type === "empty" && "개척하기"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default LandInformationPanel;
