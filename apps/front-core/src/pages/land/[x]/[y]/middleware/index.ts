import type { LandTypeXYReq } from "@/pages/land/[x]/[y]/types/page.types";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { pipe } from "@/middlewares/pages/utils/pipe";

const router = createRouter<LandTypeXYReq, ServerResponse>();

router.get(pipe<LandTypeXYReq>(checkLand));

export const middleware = makeGetServerSideProps(router);
