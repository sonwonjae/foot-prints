import { Tiptap } from "@/tiptap/components";
import { cn } from "@/utils/tailwindcss";

export default function ArticleWritePage() {
  return (
    <div
      className={cn(
        "absolute",
        "top-0",
        "bottom-0",
        "left-0",
        "right-0",
        "bg-sky-100",
        // "bg-slate-600", // night
        "pt-4",
        "pb-4",
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-col",
          "p-4",
          "max-w-3xl",
          "mx-auto",
          "my-0",
          "w-full",
          "h-full",
          "bg-white",
          "rounded-md",
          "shadow-[6px_6px_0_0_rgba(0,0,0,0.3)]",
        )}
      >
        <Tiptap className={cn("w-full", "flex-1")} />
        <div>
          <button type="button">Post</button>
        </div>
      </div>
    </div>
  );
}
