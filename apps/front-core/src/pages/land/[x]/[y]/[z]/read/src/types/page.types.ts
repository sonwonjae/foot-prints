import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { DehydratedState } from "@tanstack/react-query";

export interface LandTypeXYZReadParams extends Params {
  x: string;
  y: string;
  z: string;
}

export type LandTypeXYZReadReq = CustomIncomingMessage<LandTypeXYZReadParams>;

export interface LandTypeXYZReadPageProps {
  dehydratedState: DehydratedState;
}
