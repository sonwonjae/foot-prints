import { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

export type DefaultReq = IncomingMessage & {
  params?: object;
  body?: object;
};

export type Middleware<Req extends DefaultReq> = Parameters<
  ReturnType<typeof createRouter<IncomingMessage & Req, ServerResponse>>["get"]
>[0];
