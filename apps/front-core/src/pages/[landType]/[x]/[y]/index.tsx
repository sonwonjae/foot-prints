import type { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeXYParams {
  landType: string;
  x: string;
  y: string;
}

const router = createRouter<
  IncomingMessage & { params?: LandTypeXYParams; body?: object },
  ServerResponse
>();

router.get(checkLand);

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypeXYPage() {
  return null;
}
