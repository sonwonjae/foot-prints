import type { GetQueryOptions, MakeGetQueryOptions } from "./types";

import axios, { AxiosError } from "axios";

export const makeGetQueryOptions: MakeGetQueryOptions = <
  TQueryFnData,
  Url extends string = `/api/${string}`,
>({
  url,
}: {
  url: Url;
}) => {
  const method = "GET";

  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_HOST,
    timeout: 1000,
  });

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
          const { data } = await axiosInstance(url, {
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
    /** NOTE: next serverside req에는 cookie가 안 담기기 때문에 강제 cookie 주입 */
    //   axiosInstance.defaults.headers.Cookie = req.headers.cookie!;

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
          const { data } = await axiosInstance(url, {
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

export const makeGetMutationOptions = () => {
  return () => {};
};
