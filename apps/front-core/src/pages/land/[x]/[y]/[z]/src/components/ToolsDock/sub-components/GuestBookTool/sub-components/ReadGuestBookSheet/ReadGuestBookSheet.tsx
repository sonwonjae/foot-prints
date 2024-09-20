import { useQuery } from "@tanstack/react-query";
import { NotebookTextIcon } from "lucide-react";

import { AnimatedList } from "@/shad-cn/components/magicui/animated-list";
import { Button } from "@/shad-cn/components/ui/button";
import { ScrollArea } from "@/shad-cn/components/ui/scroll-area";
import {
  Sheet,
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
import { replaceEnterToBr } from "@/utils/content/replace";
import { makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../../../stores/selectedLand";
import { guestBookSheetStore, useGuestBookSheet } from "../../stores/sheet";

function ReadGuestBookSheet() {
  const { location } = useSelectedLand();
  const { open } = useGuestBookSheet();

  const guestbookListQueryOptions = makeGetQueryOptions({
    url: `/api/guestbooks/list/${location.x}/${location.z}`,
  });
  const { data: guestbookList = [] } = useQuery(
    guestbookListQueryOptions.getQueryOptionsInClient(),
  );
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <Sheet
          open={open === "read"}
          onOpenChange={() => {
            guestBookSheetStore.toggleWithOpen("read");
          }}
        >
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

          <TooltipContent>방명록 읽기</TooltipContent>

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
            <ScrollArea className={cn("flex-1", "-m-2", "overflow-auto")}>
              <AnimatedList className={cn("flex-1", "m-2", "gap-3")}>
                {guestbookList.map(({ id, content }) => {
                  return (
                    <div
                      key={id}
                      className={cn(
                        "text-sm",
                        "relative",
                        "mx-auto",
                        "min-h-fit",
                        "w-full",
                        "max-w-[400px]",
                        "cursor-pointer",
                        "overflow-hidden",
                        "rounded-2xl",
                        "p-3",
                        // animation styles
                        "transition-all",
                        "duration-200",
                        "ease-in-out",
                        "hover:scale-[103%]",
                        // light styles
                        "bg-white",
                        "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]",
                        // dark styles
                        "transform-gpu",
                        "dark:bg-transparent",
                        "dark:backdrop-blur-md",
                        "dark:[border:1px_solid_rgba(255,255,255,.1)]",
                      )}
                    >
                      {replaceEnterToBr(content)}
                    </div>
                  );
                })}
              </AnimatedList>
            </ScrollArea>

            <SheetFooter className={cn("sticky", "bottom-0")}>
              <Button
                onClick={() => {
                  guestBookSheetStore.toggleWithOpen("write");
                }}
              >
                방명록 남기기
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ReadGuestBookSheet;
