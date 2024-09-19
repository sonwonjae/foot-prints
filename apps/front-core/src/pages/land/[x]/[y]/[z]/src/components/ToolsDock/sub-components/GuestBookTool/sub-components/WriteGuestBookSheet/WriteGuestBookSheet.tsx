import { NotebookPenIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/shad-cn/components/ui/button";
import { Label } from "@/shad-cn/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shad-cn/components/ui/sheet";
import { Textarea } from "@/shad-cn/components/ui/textarea";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { cn } from "@/utils/tailwindcss";

function WriteGuestBookSheet() {
  const guestBookTextareaId = useId();
  const [value, setValue] = useState("");

  return (
    <TooltipProvider>
      <Tooltip>
        <Sheet>
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

          <TooltipContent>방명록 남기기</TooltipContent>

          <SheetContent
            className={cn(
              "rounded-lg",
              "border",
              "h-5/6",
              "top-4",
              "right-4",
              "flex",
              "flex-col",
            )}
          >
            <SheetHeader>
              <SheetTitle>
                <Label htmlFor={guestBookTextareaId}>방명록 남기기</Label>
              </SheetTitle>
            </SheetHeader>

            <div
              className={cn("flex-1", "flex", "w-full", "gap-1.5", "flex-col")}
            >
              <Textarea
                id={guestBookTextareaId}
                placeholder="방명록을 남겨보세요."
                maxLength={50}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                }}
                className={cn(
                  "flex-1",
                  "w-full",
                  "h-full",
                  "resize-none",
                  "border-none",
                )}
              />
              <p
                className={cn("text-sm", "text-muted-foreground", "text-right")}
              >
                {value.length}/{50}
              </p>
            </div>
            <SheetFooter className={cn("sticky", "bottom-0")}>
              <SheetClose asChild>
                <Button variant="outline">닫기</Button>
              </SheetClose>
              <Button disabled={!value.length}>작성하기</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Tooltip>
    </TooltipProvider>
  );
}

export default WriteGuestBookSheet;
