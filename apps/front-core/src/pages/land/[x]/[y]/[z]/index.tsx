import { HydrationBoundary } from "@tanstack/react-query";

import { cn } from "@/utils/tailwindcss";

import { ArticleList, LandInformationPanel } from "./src/components";
import { middleware } from "./src/middleware";
import { LandTypeXYZPageProps } from "./src/types/page.types";

export const getServerSideProps = middleware;

export default function LandTypeXYZPage({
  dehydratedState,
}: LandTypeXYZPageProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <main className={cn("w-screen", "h-screen", "relative")}>
        <ArticleList />
        <LandInformationPanel />
      </main>
    </HydrationBoundary>
  );
}
