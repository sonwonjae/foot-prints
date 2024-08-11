import { HydrationBoundary } from "@tanstack/react-query";

import { MainSection } from "./src/components";
import { middleware } from "./src/middleware";
import { LandTypeXYZReadPageProps } from "./src/types/page.types";
export const getServerSideProps = middleware;

export default function LandTypeXYZReadPage({
  dehydratedState,
}: LandTypeXYZReadPageProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <MainSection />
    </HydrationBoundary>
  );
}
