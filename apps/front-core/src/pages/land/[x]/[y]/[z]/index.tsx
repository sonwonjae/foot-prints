import { HydrationBoundary } from "@tanstack/react-query";

import { cn } from "@/utils/tailwindcss";

import { ArticleList, LandInformationPanel } from "./components";
import { middleware } from "./middleware";
import { LandTypeXYZPageProps } from "./types/page.types";

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
