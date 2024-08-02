import { IncomingMessage, ServerResponse } from "http";

import { GetServerSidePropsResult } from "next";
import { createRouter } from "next-connect";

export type DefaultReq = IncomingMessage & {
  params?: object;
  body?: object;
};

export type Middleware<
  Req extends DefaultReq = IncomingMessage,
  Props extends object = object,
> = (
  ...params: Parameters<
    Exclude<
      Parameters<
        ReturnType<
          typeof createRouter<IncomingMessage & Req, ServerResponse>
        >["get"]
      >[0],
      string | RegExp
    >
  >
) => GetServerSidePropsResult<Props> | Promise<GetServerSidePropsResult<Props>>;
