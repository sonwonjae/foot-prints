import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { DehydratedState } from "@tanstack/react-query";

export interface LandTypeXYZParams extends Params {
  x: string;
  y: string;
  z: string;
}

export type LandTypeXYZReq = CustomIncomingMessage<LandTypeXYZParams>;

export interface LandTypeXYZPageProps {
  dehydratedState: DehydratedState;
}
