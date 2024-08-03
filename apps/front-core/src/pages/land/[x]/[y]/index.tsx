import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { pipe } from "@/middlewares/pages/utils/pipe";

interface LandTypeXYParams extends Params {
  x: string;
  y: string;
}

type LandTypeXYZReq = CustomIncomingMessage<LandTypeXYParams>;

const router = createRouter<LandTypeXYZReq, ServerResponse>();

router.get(pipe<LandTypeXYZReq>(checkLand));

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypeXYPage() {
  return null;
}
