import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { DehydratedState } from "@tanstack/react-query";

export interface LandTypeXYZWriteParams extends Params {
  x: string;
  y: string;
  z: string;
}

export type LandTypeXYZWriteReq = CustomIncomingMessage<LandTypeXYZWriteParams>;

export interface LandTypeXYZWritePageProps {
  dehydratedState: DehydratedState;
}
