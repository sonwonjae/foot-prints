import type { IncomingMessage, ServerResponse } from "http";
import type { GetServerSideProps, GetServerSidePropsResult } from "next";

import { createRouter } from "next-connect";

import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeXParams {
  landType: string;
  x: string;
}

export default function LandTypeXPage() {
  return null;
}

const router = createRouter<
  IncomingMessage & { params?: LandTypeXParams; body?: object },
  ServerResponse
>();

router.use(checkLand);

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  // @ts-expect-error: attach params to req.params
  req.params = params;
  return router.run(req, res) as Promise<GetServerSidePropsResult<object>>;
};
