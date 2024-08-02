import type { Middleware } from "@/middlewares/pages/type";

import { IncomingMessage } from "http";

interface LandLocation {
  x?: string;
  y?: string;
  z?: string;
}

export const checkLandQuery = async () => {
  let a = ''
};

export const checkLand: Middleware<
  IncomingMessage & { params?: LandLocation }
> = async (req) => {
  const { x, y, z } = {
    x: Number(req.params?.x),
    y: Number(req.params?.y),
    z: Number(req.params?.z),
  };

  if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
    return {
      redirect: {
        destination: "/land/0/0/0",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
