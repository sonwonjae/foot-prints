import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MailPlusIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/shad-cn/components/ui/button";
import { Input } from "@/shad-cn/components/ui/input";
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
import {
  cheerPostboxSheetStore,
  useCheerPostboxSheet,
} from "../../stores/sheet";

function WriteCheerPostboxSheet() {
  const queryClient = useQueryClient();
  const { location } = useSelectedLand();
  const cheerMailTitleInputId = useId();
  const cheerMailContentTextareaId = useId();
  const { open } = useCheerPostboxSheet();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { mutateAsync: createCheerMail, isPending: isCheerMailCreating } =
    useMutation({
      mutationFn: async ({ content }: { content: string }) => {
        const { data } = await apiAxios.post(
          `/api/cheer-mails/${location.x}/${location.z}`,
          {
            title,
            content,
          },
        );

        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [`/api/cheer-mails/list/${location.x}/${location.z}`],
        });
        setTitle("");
        setContent("");
        cheerPostboxSheetStore.toggleWithOpen("read");
      },
    });

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <Sheet
          open={open === "write"}
          onOpenChange={() => {
            cheerPostboxSheetStore.toggleWithOpen("write");
          }}
        >
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-12", "rounded-full")}
              >
                <MailPlusIcon />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>

          <TooltipContent>사연 남기기</TooltipContent>

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
              <SheetTitle>사연 남기기</SheetTitle>
            </SheetHeader>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor={cheerMailTitleInputId}>제목</Label>
              <Input
                id={cheerMailTitleInputId}
                type="text"
                placeholder="제목을 작성해주세요."
                disabled={isCheerMailCreating}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </div>
            <div
              className={cn("flex-1", "flex", "w-full", "gap-1.5", "flex-col")}
            >
              <Label htmlFor={cheerMailContentTextareaId}>사연</Label>
              <Textarea
                disabled={isCheerMailCreating}
                id={cheerMailContentTextareaId}
                placeholder="사연을 남겨보세요."
                maxLength={500}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                className={cn("flex-1", "w-full", "h-full", "resize-none")}
              />
              <p
                className={cn("text-sm", "text-muted-foreground", "text-right")}
              >
                {content.length}/{500}
              </p>
            </div>
            <SheetFooter className={cn("sticky", "bottom-0", "max-sm:gap-2")}>
              <Button
                variant="outline"
                onClick={() => {
                  cheerPostboxSheetStore.toggleWithOpen("read");
                }}
              >
                응원의 우체통 둘러보기
              </Button>
              <Button
                disabled={
                  !title.length || !content.length || isCheerMailCreating
                }
                onClick={() => {
                  createCheerMail({ content });
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

export default WriteCheerPostboxSheet;
