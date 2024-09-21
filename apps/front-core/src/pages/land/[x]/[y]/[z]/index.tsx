import { HydrationBoundary } from "@tanstack/react-query";

import {
  ArticleList,
  ToolsDock,
} from "@/pages-src/land/[x]/[y]/[z]/src/components";
import { middleware } from "@/pages-src/land/[x]/[y]/[z]/src/middleware";
import { LandTypeXYZPageProps } from "@/pages-src/land/[x]/[y]/[z]/src/types/page.types";
import { cn } from "@/utils/tailwindcss";

export const getServerSideProps = middleware;

export default function LandTypeXYZPage({
  dehydratedState,
}: LandTypeXYZPageProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <main className={cn("w-screen", "h-screen", "relative")}>
        <ArticleList />
        <ToolsDock />
      </main>
    </HydrationBoundary>
  );
}
