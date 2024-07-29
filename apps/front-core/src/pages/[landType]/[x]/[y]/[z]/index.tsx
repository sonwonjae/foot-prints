import type { IncomingMessage, ServerResponse } from "http";
import type { GetServerSideProps, GetServerSidePropsResult } from "next";

import { createRouter } from "next-connect";

import { ArticleList } from "@/home-page/components";
import { checkLand } from "@/middlewares/pages/land/checker";
import { cn } from "@/utils/tailwindcss";

interface LandTypeXYZParams {
  landType: string;
  x: string;
  y: string;
  z: string;
}

export default function LandTypeXYZPage() {
  return (
    <main className={cn("w-screen", "h-screen", "relative")}>
      <ArticleList />
    </main>
  );
}

const router = createRouter<
  IncomingMessage & { params?: LandTypeXYZParams; body?: object },
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
