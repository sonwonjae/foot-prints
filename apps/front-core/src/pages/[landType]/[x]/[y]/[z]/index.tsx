import type { IncomingMessage, ServerResponse } from "http";

import { createRouter } from "next-connect";

import { ArticleList } from "@/home-page/components";
import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { cn } from "@/utils/tailwindcss";

interface LandTypeXYZParams {
  landType: string;
  x: string;
  y: string;
  z: string;
}

const router = createRouter<
  IncomingMessage & { params?: LandTypeXYZParams; body?: object },
  ServerResponse
>();

router.use(checkLand);

export const getServerSideProps = makeGetServerSideProps(router);

export default function LandTypeXYZPage() {
  return (
    <main className={cn("w-screen", "h-screen", "relative")}>
      <ArticleList />
    </main>
  );
}
