import { useRef } from "react";

import { Menubar } from "@/shad-cn/components/ui/menubar";
import { cn } from "@/utils/tailwindcss";

import { MenubarProvider, useMenubarContext } from "./contexts/menubar";
import { MoveTool } from "./sub-components";

function ToolsMenubarComponent() {
  const menuBarRef = useRef<HTMLDivElement>(null);
  const { openedMenu } = useMenubarContext();

  return (
    <div className={cn("absolute", "bottom-4", "right-4")}>
      <div className={cn("relative")}>
        <Menubar ref={menuBarRef} value={openedMenu}>
          <MoveTool />
        </Menubar>
      </div>
    </div>
  );
}

function ToolsMenubar() {
  return (
    <MenubarProvider>
      <ToolsMenubarComponent />
    </MenubarProvider>
  );
}

export default ToolsMenubar;
