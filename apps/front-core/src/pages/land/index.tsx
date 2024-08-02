import type { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeParams {}

const router = createRouter<
  IncomingMessage & { params?: LandTypeParams; body?: object },
  ServerResponse
>();

router.get(checkLand);

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypePage() {
  return null;
}
