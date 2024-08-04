import { useRouter } from "next/router";

import { Button } from "@/shad-cn/components/ui/button";
import { cn } from "@/utils/tailwindcss";

function LandInformationPanel() {
  const router = useRouter();

  const moveUnit = () => {
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
      <Button>[category] 방문하기</Button>
      <Button onClick={moveUnit}>개척하기</Button>
    </div>
  );
}

export default LandInformationPanel;
