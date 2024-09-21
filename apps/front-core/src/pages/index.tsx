import type { CustomIncomingMessage } from "@/middlewares/pages/type";
import type { ServerResponse } from "http";
import type { GetServerSidePropsResult } from "next";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";

interface HomePageProps {}

const router = createRouter<CustomIncomingMessage, ServerResponse>().get(
  (): GetServerSidePropsResult<HomePageProps> => {
    return {
      redirect: {
        destination: "/land/0/0/0",
        permanent: false,
      },
    };
  },
);

export const getServerSideProps = makeGetServerSideProps(router);

export default function HomePage() {
  return null;
}
