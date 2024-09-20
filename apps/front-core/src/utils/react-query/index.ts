import type { GetQueryOptions, MakeGetQueryOptions } from "./types";

import axios, { AxiosError } from "axios";

export const apiAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_HOST,
  timeout: 1000 * 60,
  withCredentials: true,
});

export const makeGetQueryOptions: MakeGetQueryOptions = <
  TQueryFnData,
  Url extends string = `/api/${string}`,
>({
  url,
}: {
  url: Url;
}) => {
  const method = "GET";

  const getQueryOptionsInClient: GetQueryOptions<TQueryFnData> = ({
    axiosConfig,
    queryOptions,
  } = {}) => {
    return {
      ...queryOptions,
      queryKey: [
        url,
        method,
        ...Object.values({ ...axiosConfig?.params }),
        ...Object.values({ ...axiosConfig?.data }),
      ] as const,
      queryFn: async () => {
        try {
          const { data } = await apiAxios(url, {
            method,
            withCredentials: true,
            ...axiosConfig,
          });

          return data as TQueryFnData;
        } catch (err) {
          const error = err as AxiosError;

          if (error.response?.status === 403) {
            window.location.replace("/login");
          }

          throw error;
        }
      },
    };
  };

  const getQueryOptionsInServer: GetQueryOptions<TQueryFnData> = ({
    axiosConfig,
    queryOptions,
  } = {}) => {
    return {
      ...queryOptions,
      enabled: false,
      queryKey: [
        url,
        method,
        ...Object.values({ ...axiosConfig?.params }),
        ...Object.values({ ...axiosConfig?.data }),
      ] as const,
      queryFn: async () => {
        try {
          const { data } = await apiAxios(url, {
            method,
            withCredentials: true,
            ...axiosConfig,
          });

          return data as TQueryFnData;
        } catch (err) {
          const error = err as AxiosError;

          if (error.response?.status === 403) {
            window.location.replace("/login");
          }

          throw error;
        }
      },
    };
  };

  return {
    baseKey: [url, method] as const,
    getQueryOptionsInClient,
    getQueryOptionsInServer,
  } as const;
};
