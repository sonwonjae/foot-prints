import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { Button } from "@/shad-cn/components/ui/button";
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
    if (location?.type === "empty") {
      await pioneerLocation();
    }
    router.push(`${window.location.pathname}/write`);
  };

  return (
    <div
      className={cn(
        "absolute",
        "top-2",
        "bottom-2",
        "right-2",
        "flex",
        "flex-col",
        "gap-2",
        "w-80",
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
      {/* FIXME: category가 있을 경우에만 표시하도록 수정 필요 */}
      {/* <Button>[category] 방문하기</Button> */}
      {/* TODO: loading ui 추가 - to shadcn */}
      <Button onClick={moveUnit} disabled={isLocationLoading}>
        {location?.type === "mine-location" && "마저 발자취 남기기"}
        {location?.type === "empty" && "개척하기"}
      </Button>
    </div>
  );
}

export default LandInformationPanel;
