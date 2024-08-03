import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeParams extends Params {}

const router = createRouter<
  CustomIncomingMessage<LandTypeParams>,
  ServerResponse
>();

router.get(checkLand);

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypePage() {
  return null;
}
