import type { UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig, Method } from "axios";

import { Article } from "@/pages/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";

export type QueryUrl = `/api/${string}`;

export interface GetQueryOptionsParam<TQueryFnData> {
  axiosConfig?: AxiosRequestConfig;
  queryOptions?: UseQueryOptions<TQueryFnData, AxiosError>;
}

export interface GetQueryOptions<TQueryFnData> {
  (
    param?: GetQueryOptionsParam<TQueryFnData>,
  ): UseQueryOptions<TQueryFnData, AxiosError>;
}

interface Custom<Url, TQueryFnData> {
  (param: { url: Url }): {
    readonly baseKey: readonly [Url, Method];
    getQueryOptionsInClient: GetQueryOptions<TQueryFnData>;
    getQueryOptionsInServer: GetQueryOptions<TQueryFnData>;
  };
}

/** NOTE: location 정보 가져오는 쿼리 */
export interface MakeGetQueryOptions
  /** FIXME: back 로직이랑 타입 싱크 맞추기 */
  extends Custom<
    `/api/locations/${number}/${number}`,
    { type: "empty" | "mine-location" }
  > {}

/** NOTE: location list 정보 가져오는 쿼리 */
export interface MakeGetQueryOptions
  extends Custom<
    `/api/locations/list/${number}/${number}${string}`,
    Article[]
  > {}
