import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";

export interface LandTypeXYParams extends Params {
  x: string;
  y: string;
}

export type LandTypeXYReq = CustomIncomingMessage<LandTypeXYParams>;
