import type { Middleware } from "@/middlewares/pages/type";

import { GetServerSidePropsResult } from "next";

interface LandLocation {
  landType?: string;
  x?: string;
  y?: string;
  z?: string;
}

export const checkLand: Middleware<{ params?: LandLocation }> = (
  req,
): GetServerSidePropsResult<object> => {
  const { x, y, z } = {
    x: Number(req.params?.x),
    y: Number(req.params?.y),
    z: Number(req.params?.z),
  };

  if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
    return {
      redirect: {
        destination: "/none/0/0/0",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
