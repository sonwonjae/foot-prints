import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";

export interface LandTypeXParams extends Params {
  x: string;
}

export type LandTypeXReq = CustomIncomingMessage<LandTypeXParams>;
