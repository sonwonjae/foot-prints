import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeXParams extends Params {
  x: string;
}

const router = createRouter<
  CustomIncomingMessage<LandTypeXParams>,
  ServerResponse
>();

router.get(checkLand);

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypeXPage() {
  return null;
}
