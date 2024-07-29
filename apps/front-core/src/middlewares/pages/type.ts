import { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

interface DefaultReq {
  params?: object;
  body?: object;
}

export type Middleware<Req extends DefaultReq> = Parameters<
  ReturnType<typeof createRouter<IncomingMessage & Req, ServerResponse>>["get"]
>[0];
