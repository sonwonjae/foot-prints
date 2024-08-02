import type { UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig, Method } from "axios";

import { Article } from "@/pages/land/[x]/[y]/[z]/components/ArticleList/ArticleList.type";
// import type { GetServerSideProps } from "next";

export type QueryUrl = `/api/${string}`;

export interface GetQueryOptionsParam<TQueryFnData> {
  axiosConfig?: AxiosRequestConfig;
  queryOptions?: UseQueryOptions<TQueryFnData, AxiosError>;
}

// export interface GetQueryOptions<TQueryFnData> {
//   (param?: GetQueryOptionsParam): UseQueryOptions<TQueryFnData>;
// }

export interface GetQueryOptions<TQueryFnData> {
  (
    param?: GetQueryOptionsParam<TQueryFnData>,
  ): UseQueryOptions<TQueryFnData, AxiosError>;
}

export interface MakeGetQueryOptions {
  <
    TQueryFnData extends Article[] = Article[],
    Url extends string = `/api/locations/${number}/${number}`,
  >(param: {
    url: Url;
  }): {
    readonly baseKey: readonly [Url, Method];
    getQueryOptionsInClient: GetQueryOptions<TQueryFnData>;
    getQueryOptionsInServer: GetQueryOptions<TQueryFnData>;
  };
  <TQueryFnData, Url extends string = `/api/${string}`>(param: {
    url: Url;
  }): {
    readonly baseKey: readonly [Url, Method];
    getQueryOptionsInClient: GetQueryOptions<TQueryFnData>;
    getQueryOptionsInServer: GetQueryOptions<TQueryFnData>;
  };
}

/** NOTE: url 지정 */
