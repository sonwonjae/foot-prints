import { useQuery } from "@tanstack/react-query";
import { MailsIcon } from "lucide-react";

import { AnimatedList } from "@/shad-cn/components/magicui/animated-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shad-cn/components/ui/accordion";
import { Button } from "@/shad-cn/components/ui/button";
import { ScrollArea } from "@/shad-cn/components/ui/scroll-area";
import { Separator } from "@/shad-cn/components/ui/separator";
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
import {
  cheerPostboxSheetStore,
  useCheerPostboxSheet,
} from "../../stores/sheet";

import {
  cheerMailAccordionStore,
  useCheerMailAccordion,
} from "./stores/accordion";
import { ReadCheerMailReplyList, WriteCheerMailReply } from "./sub-components";

function ReadCheerPostboxSheet() {
  const { location } = useSelectedLand();
  const { open } = useCheerPostboxSheet();
  const { value } = useCheerMailAccordion();

  const cheerMailListQueryOptions = makeGetQueryOptions({
    url: `/api/cheer-mails/list/${location.x}/${location.z}`,
  });
  const { data: cheerMailList = [] } = useQuery(
    cheerMailListQueryOptions.getQueryOptionsInClient(),
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <Sheet
          open={open === "read"}
          onOpenChange={() => {
            cheerPostboxSheetStore.toggleWithOpen("read");
          }}
        >
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-12", "rounded-full")}
              >
                <MailsIcon />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>

          <TooltipContent>응원의 우체통 둘러보기</TooltipContent>

          <SheetContent
            className={cn(
              "rounded-lg",
              "border",
              "h-5/6",
              "top-4",
              "right-4",
              "flex",
              "flex-col",
              "max-sm:left-4",
              "max-sm:w-auto",
            )}
          >
            <SheetHeader>
              <SheetTitle>응원의 우체통</SheetTitle>
            </SheetHeader>
            <ScrollArea className={cn("flex-1", "-m-2", "overflow-auto")}>
              <Accordion type="single" collapsible value={value}>
                <AnimatedList className={cn("flex-1", "m-2", "gap-3")}>
                  {cheerMailList.map(({ id, title, content }) => {
                    return (
                      <AccordionItem
                        value={id}
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
                          "no-underline",
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
                        <AccordionTrigger
                          onClick={() => {
                            cheerMailAccordionStore.toggleWithValue(id);
                          }}
                        >
                          <h6 className={cn("text-xs")}>{title}</h6>
                        </AccordionTrigger>
                        <AccordionContent className={cn("cursor-default")}>
                          <div
                            className={cn(
                              "flex",
                              "w-full",
                              "flex-col",
                              "gap-4",
                            )}
                          >
                            <div>{replaceEnterToBr(content)}</div>
                            <Separator />
                            <ReadCheerMailReplyList cheerMailId={id} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </AnimatedList>
              </Accordion>
            </ScrollArea>

            <SheetFooter className={cn("sticky", "bottom-0", "max-sm:gap-2")}>
              {!value && (
                <Button
                  onClick={() => {
                    cheerPostboxSheetStore.toggleWithOpen("write");
                  }}
                >
                  사연 남기기
                </Button>
              )}
              {value && <WriteCheerMailReply cheerMailId={value} />}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ReadCheerPostboxSheet;
