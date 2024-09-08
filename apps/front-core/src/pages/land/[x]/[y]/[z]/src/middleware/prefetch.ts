import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZReq } from "@/pages/land/[x]/[y]/[z]/src/types/page.types";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import qs from "query-string";

import { makeGetQueryOptions } from "@/utils/react-query";

export const prefetch: Middleware<LandTypeXYZReq> = async (req) => {
  const { x = "0", z = "0" } = req.params || {};
  const { sx, sz } = req.query || {};

  const queryClient = new QueryClient();

  const queryString = `?${qs.stringify({
    range: req.query.range,
  })}`;

  const locationListQuery = makeGetQueryOptions({
    url: `/api/locations/list/${Number(x)}/${Number(z)}${queryString}`,
  });
  const locationListQueryOptions = locationListQuery.getQueryOptionsInServer();

  const locationQuery = makeGetQueryOptions({
    url: `/api/locations/${Number(sx)}/${Number(sz)}`,
  });
  const locationQueryOptions = locationQuery.getQueryOptionsInServer({
    queryOptions: {
      enabled: !Number.isNaN(Number(sx)) && !Number.isNaN(Number(sz)),
    },
  });

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
