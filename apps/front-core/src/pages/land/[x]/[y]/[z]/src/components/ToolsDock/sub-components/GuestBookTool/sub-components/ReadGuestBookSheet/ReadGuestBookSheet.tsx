import { NotebookTextIcon } from "lucide-react";

import { AnimatedList } from "@/shad-cn/components/magicui/animated-list";
import { Button } from "@/shad-cn/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shad-cn/components/ui/sheet";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { cn } from "@/utils/tailwindcss";

function ReadGuestBookSheet() {
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
                <NotebookTextIcon />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>

          <TooltipContent>방명록</TooltipContent>

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
              <SheetTitle>방명록</SheetTitle>
            </SheetHeader>
            <div className={cn("flex-1", "-m-2", "overflow-auto")}>
              <AnimatedList className={cn("flex-1", "m-2")}>
                {/** FIXME: 실제 Data로 교체 필요 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => {
                  return (
                    <div
                      key={key}
                      className={cn(
                        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
                        // animation styles
                        "transition-all duration-200 ease-in-out hover:scale-[103%]",
                        // light styles
                        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]",
                        // dark styles
                        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]",
                      )}
                    >
                      {key}. hello
                      <br></br>
                      mr. son
                    </div>
                  );
                })}
              </AnimatedList>
            </div>

            <SheetFooter className={cn("sticky", "bottom-0")}>
              <SheetClose asChild>
                <Button variant="outline">닫기</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ReadGuestBookSheet;
