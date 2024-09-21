import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback } from "@/shad-cn/components/ui/avatar";
import { ScrollArea } from "@/shad-cn/components/ui/scroll-area";
import { Skeleton } from "@/shad-cn/components/ui/skeleton";
import { replaceEnterToBr } from "@/utils/content/replace";
import { makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { useCheerMailAccordion } from "../../stores/accordion";

interface ReadCheerMailReplyListProps {
  cheerMailId: string;
}

function ReadCheerMailReplyList({ cheerMailId }: ReadCheerMailReplyListProps) {
  const { value } = useCheerMailAccordion();

  const cheerMailReplyListQueryOptions = makeGetQueryOptions({
    url: `/api/cheer-mails-replies/list/${cheerMailId}`,
  });
  const {
    data: cheerMailReplyList = [],
    isLoading: isCheerMailReplyListLoading,
  } = useQuery(
    cheerMailReplyListQueryOptions.getQueryOptionsInClient({
      queryOptions: {
        enabled: value === cheerMailId,
      },
    }),
  );

  const isCheerMailReplyListEmpty =
    !isCheerMailReplyListLoading && cheerMailReplyList.length === 0;
  const isCheerMailReplyListReady = !isCheerMailReplyListEmpty;

  return (
    <div>
      <div className={cn("text-xs", "text-slate-600", "w-full", "pb-2")}>
        응원 메시지
      </div>
      <ScrollArea className="h-fit">
        <div
          className={cn("flex", "gap-1", "flex-wrap", "max-h-40", "max-h-48")}
        >
          {isCheerMailReplyListLoading &&
            Array.from({ length: 3 }, (_, index) => {
              return (
                <Skeleton
                  key={cheerMailId + index}
                  className={cn("h-6", "w-full")}
                />
              );
            })}
          {isCheerMailReplyListEmpty && (
            <div className={cn("w-full", "text-slate-400", "text-xs")}>
              아직 아무도 응원하지 않았네요.
              <br />
              응원을 나누고 서로의 힘이 되어주세요!
            </div>
          )}
          {isCheerMailReplyListReady &&
            cheerMailReplyList.map(({ content }) => {
              return (
                <div
                  className={cn("flex", "gap-3", "w-full", "pb-2", "text-xs")}
                >
                  <Avatar className={cn("w-8", "h-8")}>
                    <AvatarFallback className={cn("text-xs")}>
                      익명
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("pt-2")}>{replaceEnterToBr(content)}</div>
                </div>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ReadCheerMailReplyList;
