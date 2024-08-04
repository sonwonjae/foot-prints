import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";

export interface LandTypeXYZWriteParams extends Params {
  x: string;
  y: string;
  z: string;
}

export type LandTypeXYZWriteReq = CustomIncomingMessage<LandTypeXYZWriteParams>;
