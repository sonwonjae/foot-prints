import { NotebookPenIcon, NotebookTextIcon } from "lucide-react";
import { useState } from "react";

import { Dock, DockIcon } from "@/shad-cn/components/magicui/dock";
import { Button } from "@/shad-cn/components/ui/button";
import { Separator } from "@/shad-cn/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shad-cn/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { Tiptap } from "@/tiptap/components";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../stores/selectedLand";

function GuestBookTool() {
  const { landType } = useSelectedLand();

  const [value, setValue] = useState("");

  if (landType !== "guest-book") {
    return null;
  }

  return (
    <TooltipProvider>
      <Sheet>
        <Dock direction="middle" className={cn("bg-white")}>
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-12", "rounded-full")}
                >
                  <NotebookTextIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>방명록 읽기</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <Separator orientation="vertical" className="h-full" />
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("size-12", "rounded-full")}
                  >
                    <NotebookPenIcon />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>방명록 남기기</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>방명록 남기기</SheetTitle>
          </SheetHeader>
          <Tiptap
            value={value}
            onChange={({ html }) => {
              setValue(html);
            }}
            placeholder="방명록을 남겨보세요!"
            editable
            maxLength={50}
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

export default GuestBookTool;
