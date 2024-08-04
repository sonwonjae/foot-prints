import type { LandTypeXReq } from "@/pages/land/[x]/src/types/page.types";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";
import { checkLand } from "@/middlewares/pages/land/checker";
import { pipe } from "@/middlewares/pages/utils/pipe";

const router = createRouter<LandTypeXReq, ServerResponse>();

router.get(pipe<LandTypeXReq>(checkLand));

export const middleware = makeGetServerSideProps(router);
