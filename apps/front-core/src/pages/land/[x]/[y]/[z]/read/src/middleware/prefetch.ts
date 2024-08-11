import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZWriteReq } from "@/pages/land/[x]/[y]/[z]/write/src/types/page.types";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { makeGetQueryOptions } from "@/utils/react-query";

export const prefetch: Middleware<LandTypeXYZWriteReq> = async (req) => {
  const { x = "0", z = "0" } = req.params || {};
  const queryClient = new QueryClient();

  const articleQuery = makeGetQueryOptions({
    url: `/api/foot-prints/article/${Number(x)}/${Number(z)}`,
  });
  const articleQueryOptions = articleQuery.getQueryOptionsInServer();

  try {
    await queryClient.prefetchQuery(articleQueryOptions);
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
};
