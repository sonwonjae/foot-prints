import type {
  Middleware,
  CustomIncomingMessage,
} from "@/middlewares/pages/type";

import { GetServerSidePropsResult } from "next";

export const pipe = <
  Req = CustomIncomingMessage,
  Props extends object = object,
>(
  ...middlewareList: Array<
    Middleware<CustomIncomingMessage & Req, Props | object>
  >
): Middleware<CustomIncomingMessage & Req, Props> => {
  return async (...args) => {
    let accProps: UnionToIntersection<
      GetServerSidePropsResult<Props>
    >["props"] = {} as Props;

    for await (const middleware of middlewareList) {
      if (typeof middleware !== "function") {
        throw new Error("pipe 함수 파라미터에는 함수 타입만 허용합니다.");
      }

      const { props, redirect, notFound } =
        ((await middleware(...args)) as UnionToIntersection<
          GetServerSidePropsResult<Props>
        >) || {};

      if (redirect) {
        return { redirect };
      }
      if (notFound) {
        return { notFound };
      }

      if (props) {
        accProps = {
          ...accProps,
          ...props,
        };
      }
    }

    return {
      props: accProps,
    };
  };
};
