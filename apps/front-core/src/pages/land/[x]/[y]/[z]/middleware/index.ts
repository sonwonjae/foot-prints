import type {
  LandTypeXYZPageProps,
  LandTypeXYZReq,
} from "@/pages/land/[x]/[y]/[z]/types/page.types";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { pipe } from "@/middlewares/pages/utils/pipe";

import { prefetch } from "./prefetch";

const router = createRouter<LandTypeXYZReq, ServerResponse>();

router.get(pipe<LandTypeXYZReq, LandTypeXYZPageProps>(checkLand, prefetch));

export const middleware = makeGetServerSideProps(router);
