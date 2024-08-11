import type {
  LandTypeXYZWritePageProps,
  LandTypeXYZWriteReq,
} from "@/pages/land/[x]/[y]/[z]/write/src/types/page.types";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { pipe } from "@/middlewares/pages/utils/pipe";

import { prefetch } from "./prefetch";

const router = createRouter<LandTypeXYZWriteReq, ServerResponse>();

router.get(pipe<LandTypeXYZWriteReq, LandTypeXYZWritePageProps>(prefetch));

export const middleware = makeGetServerSideProps(router);
