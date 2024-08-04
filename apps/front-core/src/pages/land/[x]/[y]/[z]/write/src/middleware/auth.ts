import type { Middleware } from "@/middlewares/pages/type";
import type { LandTypeXYZWriteReq } from "@/pages/land/[x]/[y]/[z]/write/src/types/page.types";

import { apiAxios } from "@/utils/react-query";

export const checkAuth: Middleware<LandTypeXYZWriteReq> = async (req) => {
  const { x = "0", z = "0" } = req.params || {};
  try {
    await apiAxios.get(`/api/foot-prints/auth/${x}/${z}`);

    return {
      props: {},
    };
  } catch (err) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
