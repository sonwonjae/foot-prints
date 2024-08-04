import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZWriteReq } from "@/pages/land/[x]/[y]/[z]/write/src/types/page.types";

export const checkAuth: Middleware<LandTypeXYZWriteReq> = async (req) => {
  console.log(req.closed);
  return {
    props: {},
  };
};
