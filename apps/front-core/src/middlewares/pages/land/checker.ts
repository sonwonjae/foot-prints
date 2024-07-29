import type { Middleware } from "@/middlewares/pages/type";

import { IncomingMessage } from "http";

import { GetServerSidePropsResult } from "next";

interface LandLocation {
  landType?: string;
  x?: string;
  y?: string;
  z?: string;
}

export const checkLand: Middleware<
  IncomingMessage & { params?: LandLocation }
> = async (req): Promise<GetServerSidePropsResult<object>> => {
  const { x, y, z } = {
    x: Number(req.params?.x),
    y: Number(req.params?.y),
    z: Number(req.params?.z),
  };

  console.log({ x, y, z });

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
