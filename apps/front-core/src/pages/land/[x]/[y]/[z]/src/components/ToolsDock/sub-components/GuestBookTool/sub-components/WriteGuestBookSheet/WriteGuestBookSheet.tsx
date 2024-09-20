import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotebookPenIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/shad-cn/components/ui/button";
import { Label } from "@/shad-cn/components/ui/label";
import {
  Sheet,
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
import { apiAxios } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { useSelectedLand } from "../../../../../../stores/selectedLand";
import { guestBookSheetStore, useGuestBookSheet } from "../../stores/sheet";

function WriteGuestBookSheet() {
  const queryClient = useQueryClient();
  const { location } = useSelectedLand();
  const guestBookTextareaId = useId();
  const { open } = useGuestBookSheet();
  const [content, setContent] = useState("");

  const { mutateAsync: createGuestBook, isPending: isGuestBookCreating } =
    useMutation({
      mutationFn: async ({ content }: { content: string }) => {
        const { data } = await apiAxios.post(
          `/api/guestbooks/${location.x}/${location.z}`,
          {
            content,
          },
        );

        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`/api/guestbooks/list/${location.x}/${location.z}`],
        });
        setContent("");
        guestBookSheetStore.toggleWithOpen("read");
      },
    });

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <Sheet
          open={open === "write"}
          onOpenChange={() => {
            guestBookSheetStore.toggleWithOpen("write");
          }}
        >
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
                disabled={isGuestBookCreating}
                id={guestBookTextareaId}
                placeholder="방명록을 남겨보세요."
                maxLength={50}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
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
                {content.length}/{50}
              </p>
            </div>
            <SheetFooter className={cn("sticky", "bottom-0")}>
              <Button
                variant="outline"
                onClick={() => {
                  guestBookSheetStore.toggleWithOpen("read");
                }}
              >
                방명록 보기
              </Button>
              <Button
                disabled={!content.length || isGuestBookCreating}
                onClick={() => {
                  createGuestBook({ content });
                }}
              >
                작성하기
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Tooltip>
    </TooltipProvider>
  );
}

export default WriteGuestBookSheet;
