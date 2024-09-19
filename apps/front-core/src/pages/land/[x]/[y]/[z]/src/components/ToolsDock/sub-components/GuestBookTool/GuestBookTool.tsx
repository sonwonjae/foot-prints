import { Dock, DockIcon } from "@/shad-cn/components/magicui/dock";
import { Separator } from "@/shad-cn/components/ui/separator";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../stores/selectedLand";

import { ReadGuestBookSheet, WriteGuestBookSheet } from "./sub-components";

function GuestBookTool() {
  const { landType } = useSelectedLand();

  if (landType !== "guest-book") {
    return null;
  }

  return (
    <Dock direction="middle" className={cn("bg-white")}>
      <DockIcon>
        <ReadGuestBookSheet />
      </DockIcon>
      <Separator orientation="vertical" className="h-full" />
      <DockIcon>
        <WriteGuestBookSheet />
      </DockIcon>
    </Dock>
  );
}

export default GuestBookTool;
