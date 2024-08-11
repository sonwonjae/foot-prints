import { HydrationBoundary } from "@tanstack/react-query";

import { MainSection } from "./src/components";
import { middleware } from "./src/middleware";
import { LandTypeXYZWritePageProps } from "./src/types/page.types";
export const getServerSideProps = middleware;

export default function LandTypeXYZWritePage({
  dehydratedState,
}: LandTypeXYZWritePageProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <MainSection />
    </HydrationBoundary>
  );
}
