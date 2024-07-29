import type { IncomingMessage, ServerResponse } from "http";

import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { createRouter } from "next-connect";

type PageRouter = ReturnType<
  typeof createRouter<IncomingMessage, ServerResponse>
>;

export const makeGetServerSideProps = <
  PageProps extends object,
  Router extends PageRouter,
>(
  router: Router,
) => {
  const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    params,
  }) => {
    // @ts-expect-error: attach params to req.params
    req.params = params;
    return router.run(req, res) as Promise<GetServerSidePropsResult<PageProps>>;
  };

  return getServerSideProps;
};
