import { useRouter } from "next/router";

import { LandTypeXYZParams } from "@/pages/land/[x]/[y]/[z]/src/types/page.types";
import { cn } from "@/utils/tailwindcss";

function LandInformationPanel() {
  const router = useRouter();
  const { x, y, z } = router.query as LandTypeXYZParams;

  return (
    <div
      className={cn(
        "absolute",
        "top-2",
        "bottom-2",
        "right-2",
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
      [{x} {y} {z}]
    </div>
  );
}

export default LandInformationPanel;
