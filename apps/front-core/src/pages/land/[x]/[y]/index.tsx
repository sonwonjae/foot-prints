import type { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { pipe } from "@/middlewares/pages/utils/pipe";

interface LandTypeXYParams {
  x: string;
  y: string;
}

type LandTypeXYZReq = IncomingMessage & {
  params?: LandTypeXYParams;
};

const router = createRouter<LandTypeXYZReq, ServerResponse>();

router.get(pipe<LandTypeXYZReq>(checkLand));

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypeXYPage() {
  return null;
}
