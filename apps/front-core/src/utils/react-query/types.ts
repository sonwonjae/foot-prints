import type { UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig, Method } from "axios";

import { Article } from "@/pages-src/land/[x]/[y]/[z]/src/components/ArticleList/ArticleList.type";

export type QueryUrl = `/api/${string}`;

export interface GetQueryOptionsParam<TQueryFnData> {
  axiosConfig?: AxiosRequestConfig;
  queryOptions?: Partial<UseQueryOptions<TQueryFnData, AxiosError>>;
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

/** FIXME: back 로직이랑 타입 싱크 맞추기 */

/** NOTE: cheer postbox list 정보 가져오는 쿼리 */
export interface MakeGetQueryOptions
  extends Custom<
    `/api/cheer-mails/list/${number}/${number}`,
    Array<{
      id: string;
      title: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {}

export interface MakeGetQueryOptions
  extends Custom<
    `/api/cheer-mails-replies/list/${string}`,
    Array<{
      id: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {}

/** NOTE: guestbook list 정보 가져오는 쿼리 */
export interface MakeGetQueryOptions
  extends Custom<
    `/api/guestbooks/list/${number}/${number}`,
    Array<{
      id: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {}

/** NOTE: location list 정보 가져오는 쿼리 */
export interface MakeGetQueryOptions
  extends Custom<
    `/api/locations/list/${number}/${number}${string}`,
    Article[]
  > {}
