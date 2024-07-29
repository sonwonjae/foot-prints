import type { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeXParams {
  landType: string;
  x: string;
}

const router = createRouter<
  IncomingMessage & { params?: LandTypeXParams; body?: object },
  ServerResponse
>();

router.get(checkLand);

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypeXPage() {
  return null;
}
