import type { IncomingMessage, ServerResponse } from "http";
import type { GetServerSideProps, GetServerSidePropsResult } from "next";

import { createRouter } from "next-connect";

export default function HomePage() {
  return null;
}

interface HomePageProps {}

const router = createRouter<
  IncomingMessage & {
    body?: Record<string, string | number>;
    params?: Record<string, string>;
  },
  ServerResponse
>().get((): GetServerSidePropsResult<HomePageProps> => {
  return {
    redirect: {
      destination: "/land/0/0/0",
      permanent: false,
    },
  };
});

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  // @ts-expect-error: attach params to req.params
  req.params = params;
  return router.run(req, res) as Promise<
    GetServerSidePropsResult<HomePageProps>
  >;
};
