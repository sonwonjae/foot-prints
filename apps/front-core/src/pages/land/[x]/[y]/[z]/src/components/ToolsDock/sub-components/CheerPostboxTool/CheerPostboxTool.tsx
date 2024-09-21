import { Dock, DockIcon } from "@/shad-cn/components/magicui/dock";
import { Separator } from "@/shad-cn/components/ui/separator";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../stores/selectedLand";
import { MoveButton } from "../../common-tools";

import {
  ReadCheerPostboxSheet,
  WriteCheerPostboxSheet,
} from "./sub-components";

function CheerPostboxTool() {
  const { landType } = useSelectedLand();

  if (landType !== "cheer-postbox") {
    return null;
  }
  return (
    <Dock direction="middle" className={cn("bg-white")}>
      <DockIcon>
        <ReadCheerPostboxSheet />
      </DockIcon>
      <DockIcon>
        <WriteCheerPostboxSheet />
      </DockIcon>
      <Separator orientation="vertical" className="h-full" />
      <DockIcon>
        <MoveButton />
      </DockIcon>
    </Dock>
  );
}

export default CheerPostboxTool;
