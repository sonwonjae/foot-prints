import { HydrationBoundary } from "@tanstack/react-query";

import { cn } from "@/utils/tailwindcss";

import { ArticleList, LandInformationPanel } from "./src/components";
import { ArticleMapProvider } from "./src/contexts/articleMap";
import { middleware } from "./src/middleware";
import { LandTypeXYZPageProps } from "./src/types/page.types";

export const getServerSideProps = middleware;

export default function LandTypeXYZPage({
  dehydratedState,
}: LandTypeXYZPageProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <ArticleMapProvider>
        <main className={cn("w-screen", "h-screen", "relative")}>
          <ArticleList />
          <LandInformationPanel />
        </main>
      </ArticleMapProvider>
    </HydrationBoundary>
  );
}
