import type { IncomingMessage, ServerResponse } from "http";

import {
  dehydrate,
  DehydratedState,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { pipe } from "@/middlewares/pages/utils/pipe";
import { makeGetQueryOptions } from "@/utils/react-query";
import { cn } from "@/utils/tailwindcss";

import { ArticleList, LandInformationPanel } from "./components";
import { LandTypeXYZParams } from "./types/page.types";

type LandTypeXYZReq = IncomingMessage & {
  params?: LandTypeXYZParams;
};

interface LandTypeXYZPageProps {
  dehydratedState: DehydratedState;
}

const router = createRouter<LandTypeXYZReq, ServerResponse>();

router.get(
  pipe<LandTypeXYZReq, LandTypeXYZPageProps>(checkLand, async (req) => {
    const { x = 0, z = 0 } = req.params || {};
    const queryClient = new QueryClient();

    const locationQuery = makeGetQueryOptions({
      url: `/api/locations/${Number(x)}/${Number(z)}`,
    });
    const queryOptions = locationQuery.getQueryOptionsInServer();

    try {
      await queryClient.prefetchQuery(queryOptions);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 403) {
        return {
          redirect: {
            destination: "/login",
          },
          props: { dehydratedState: dehydrate(queryClient) },
        };
      }
    }

    return { props: { dehydratedState: dehydrate(queryClient) } };
  }),
);

export const getServerSideProps = makeGetServerSideProps(router);

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
