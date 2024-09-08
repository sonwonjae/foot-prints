import { useRef, useEffect } from "react";

import { Menubar } from "@/shad-cn/components/ui/menubar";
import { cn } from "@/utils/tailwindcss";

import { MenubarProvider, useMenubarContext } from "./contexts/menubar";
import { PioneerTool, MoveTool, VisitTool, ManageTool } from "./sub-components";

function ToolsMenubarComponent() {
  const menuBarRef = useRef<HTMLDivElement>(null);
  const { openedMenu } = useMenubarContext();

  return (
    <div className={cn("absolute", "bottom-4", "right-4")}>
      <div className={cn("relative")}>
        <Menubar ref={menuBarRef} value={openedMenu}>
          <PioneerTool />
          <MoveTool />
          <VisitTool />
          <ManageTool />
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
