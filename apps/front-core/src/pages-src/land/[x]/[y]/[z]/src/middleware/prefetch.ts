import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZReq } from "@/pages-src/land/[x]/[y]/[z]/src/types/page.types";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import qs from "query-string";

import { makeGetQueryOptions } from "@/utils/react-query";

export const prefetch: Middleware<LandTypeXYZReq> = async (req) => {
  const x = Number(req.params?.x);
  const z = Number(req.params?.z);
  const range = Number(req.query?.range);

  const queryClient = new QueryClient();

  const queryString = `?${qs.stringify({
    range,
  })}`;

  const fx = x - (x % range);
  const fz = z - (z % range);

  const locationListQuery = makeGetQueryOptions({
    url: `/api/locations/list/${fx}/${fz}${queryString}`,
  });
  const locationListQueryOptions = locationListQuery.getQueryOptionsInServer();

  try {
    await queryClient.prefetchQuery(locationListQueryOptions);
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
