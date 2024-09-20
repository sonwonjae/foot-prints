import { Dock, DockIcon } from "@/shad-cn/components/magicui/dock";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../stores/selectedLand";
import { MoveButton } from "../../common-tools";

function GrassTool() {
  const { landType } = useSelectedLand();

  if (landType !== "grass") {
    return null;
  }

  return (
    <Dock direction="middle" className={cn("bg-white")}>
      <DockIcon>
        <MoveButton />
      </DockIcon>
    </Dock>
  );
}

export default GrassTool;
