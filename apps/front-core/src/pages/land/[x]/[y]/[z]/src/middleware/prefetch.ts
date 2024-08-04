import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZReq } from "@/pages/land/[x]/[y]/[z]/src/types/page.types";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import QueryString from "qs";

import { makeGetQueryOptions } from "@/utils/react-query";

export const prefetch: Middleware<LandTypeXYZReq> = async (req) => {
  const { x = 0, z = 0 } = req.params || {};
  const queryClient = new QueryClient();

  const queryString = `?${QueryString.stringify({
    range: req.query.range,
  })}`;

  const locationQuery = makeGetQueryOptions({
    url: `/api/locations/${Number(x)}/${Number(z)}${queryString}`,
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
};
