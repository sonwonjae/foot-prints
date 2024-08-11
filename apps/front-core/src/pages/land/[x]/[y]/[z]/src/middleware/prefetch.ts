import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZReq } from "@/pages/land/[x]/[y]/[z]/src/types/page.types";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import QueryString from "query-string";

import { makeGetQueryOptions } from "@/utils/react-query";

export const prefetch: Middleware<LandTypeXYZReq> = async (req) => {
  const { x = "0", z = "0" } = req.params || {};
  const queryClient = new QueryClient();

  const queryString = `?${QueryString.stringify({
    range: req.query.range,
  })}`;

  const locationListQuery = makeGetQueryOptions({
    url: `/api/locations/list/${Number(x)}/${Number(z)}${queryString}`,
  });
  const locationListQueryOptions = locationListQuery.getQueryOptionsInServer();

  const locationQuery = makeGetQueryOptions({
    url: `/api/locations/${Number(x)}/${Number(z)}`,
  });
  const locationQueryOptions = locationQuery.getQueryOptionsInServer();

  try {
    await queryClient.prefetchQuery(locationListQueryOptions);
    await queryClient.prefetchQuery(locationQueryOptions);
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
