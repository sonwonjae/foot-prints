import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/shad-cn/components/ui/button";
import { Textarea } from "@/shad-cn/components/ui/textarea";
import { apiAxios } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

interface WriteCheerMailReplyProps {
  cheerMailId: string;
}

function WriteCheerMailReply({ cheerMailId }: WriteCheerMailReplyProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const {
    mutateAsync: createCheerMailReply,
    isPending: isCheerMailReplyCreating,
  } = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const { data } = await apiAxios.post(
        `/api/cheer-mails-replies/${cheerMailId}`,
        {
          content,
        },
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/cheer-mails-replies/list/${cheerMailId}`],
      });
      setContent("");
    },
  });

  return (
    <div
      className={cn(
        "flex",
        "w-full",
        "justify-end",
        "flex-wrap",
        "gap-1.5",
        "flex-col",
      )}
    >
      <div className={cn("flex-1", "flex", "w-full", "gap-1.5", "flex-col")}>
        <Textarea
          disabled={isCheerMailReplyCreating}
          placeholder="응원을 남겨보세요."
          maxLength={100}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          className={cn("flex-1", "w-full", "h-full", "resize-none", "text-xs")}
        />
        <p className={cn("text-xs", "text-muted-foreground", "text-right")}>
          {content.length}/{100}
        </p>
      </div>
      <div className={cn("flex", "w-full", "justify-end")}>
        <Button
          onClick={() => {
            createCheerMailReply({ content });
          }}
        >
          응원하기
        </Button>
      </div>
    </div>
  );
}

export default WriteCheerMailReply;
