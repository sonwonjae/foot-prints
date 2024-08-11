import type { AxiosError } from "axios";
import type { ChangeEventHandler, ComponentProps } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "es-toolkit";
import { EyeIcon, EyeOffIcon, MapIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shad-cn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shad-cn/components/ui/tooltip";
import { Tiptap } from "@/tiptap/components";
import { apiAxios, makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

interface Body {
  x: string;
  z: string;
  isPublic?: boolean;
  title?: string;
  description?: string;
  content?: string;
}

const parseBody = ({
  x,
  z,
  isPublic = true,
  title = "",
  description = "",
  content = "",
}: Body) => {
  return {
    x: Number(x),
    z: Number(z),
    isPublic,
    title,
    description,
    content,
  };
};

export default function MainSection() {
  const router = useRouter();

  const articleQuery = makeGetQueryOptions({
    url: `/api/foot-prints/article/${Number(router.query.x)}/${Number(router.query.z)}`,
  });

  const queryClient = useQueryClient();
  const { data: article } = useQuery(articleQuery.getQueryOptionsInClient({}));

  const { mutateAsync: createFootPrintMutate, isPending: isCreating } =
    useMutation({
      mutationFn: async (body: Body) => {
        const parsedBody = parseBody(body);
        try {
          await apiAxios.post("/api/foot-prints", parsedBody);
          await queryClient.invalidateQueries({
            queryKey: articleQuery.baseKey,
          });
        } catch (error) {
          throw error as AxiosError;
        }
      },
      onSuccess: () => {
        toast.success("발자국 생성 성공!");
      },
    });
  const { mutateAsync: updateFootPrintMutate, isPending: isUpdating } =
    useMutation({
      mutationFn: async (body: Body) => {
        const parsedBody = parseBody(body);
        try {
          await apiAxios.patch("/api/foot-prints", parsedBody);
          await queryClient.invalidateQueries({
            queryKey: articleQuery.baseKey,
          });
        } catch (error) {
          throw error as AxiosError;
        }
      },
      onSuccess: () => {
        toast.success("발자국 저장 완료!", {
          action: {
            label: "확인",
            onClick: () => {},
          },
        });
      },
    });

  const submitFootPrint = useCallback(
    debounce(async (body: Body) => {
      if (isCreating || isUpdating) {
        return;
      }

      if (!body.title) {
        toast.error("제목은 비워둘수 없습니다.");
        return;
      }

      if (!body.content) {
        toast.error("내용은 비워둘수 없습니다.");
        return;
      }

      if (article) {
        await updateFootPrintMutate(body);
        return;
      }
      await createFootPrintMutate(body);
    }, 1000),
    [isCreating, isUpdating],
  );

  const [title, setTitle] = useState(article?.title ?? "");
  const changeTitle: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitle(e.target.value);
    submitFootPrint({
      x: router.query.x as string,
      z: router.query.z as string,
      isPublic: true,
      title: e.target.value,
      description: "",
      content,
    });
  };

  const [content, setContent] = useState(article?.content ?? "");
  const saveContent: ComponentProps<typeof Tiptap>["onChange"] = ({ html }) => {
    setContent(html);
    submitFootPrint({
      x: router.query.x as string,
      z: router.query.z as string,
      isPublic: true,
      title,
      description: "",
      content: html,
    });
  };

  return (
    <div
      className={cn(
        "absolute",
        "top-0",
        "bottom-0",
        "left-0",
        "right-0",
        "overflow-auto",
      )}
    >
      <div
        className={cn(
          "grid",
          "grid-cols-[5rem_auto_5rem]",
          "grid-rows-[2.5rem_1fr_2.5rem]",
          "gap-4",
          "p-6",
          "mx-auto",
          "my-0",
          "w-full",
          "h-full",
          "bg-white",
          "rounded-md",
          "overflow-hidden",
        )}
      >
        <div />
        <input
          className={cn("font-bold", "text-4xl", "focus:outline-none")}
          placeholder="제목을 입력해주세요."
          value={title}
          onChange={changeTitle}
        />
        <div />
        <div />
        <Tiptap
          value={content}
          editable
          onChange={saveContent}
          placeholder="글을 작성해주세요."
          className={cn("overflow-y-auto")}
        />
        <div />
        <div />
        <div className={cn("flex", "justify-end", "gap-2")}>
          <TooltipProvider>
            {article && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => {
                      submitFootPrint({
                        x: router.query.x as string,
                        z: router.query.z as string,
                        isPublic: !article?.isPublic,
                        title,
                        description: "",
                        content,
                      });
                    }}
                  >
                    {article.isPublic && <EyeOffIcon />}
                    {!article.isPublic && <EyeIcon />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {article?.isPublic && "숨기기"}
                  {!article?.isPublic && "공개하기"}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button asChild size="icon" onClick={() => {}}>
                  <Link
                    href={`/land/${router.query.x}/${router.query.y}/${router.query.z}`}
                  >
                    <MapIcon />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>지도로 돌아가기</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  disabled={isCreating || isUpdating}
                  onClick={() => {
                    submitFootPrint({
                      x: router.query.x as string,
                      z: router.query.z as string,
                      isPublic: true,
                      title,
                      description: "",
                      content,
                    });
                  }}
                >
                  <SaveIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>저장하기</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div />
      </div>
    </div>
  );
}
