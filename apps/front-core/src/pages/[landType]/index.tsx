import type { IncomingMessage, ServerResponse } from "http";
import type { GetServerSideProps, GetServerSidePropsResult } from "next";

import { createRouter } from "next-connect";

import { checkLand } from "@/middlewares/pages/land/checker";

interface LandTypeParams {
  landType: string;
}

export default function LandTypePage() {
  return null;
}

const router = createRouter<
  IncomingMessage & { params?: LandTypeParams; body?: object },
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
