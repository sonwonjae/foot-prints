import type {
  Middleware,
  Params,
  Query,
  CustomIncomingMessage,
} from "@/middlewares/pages/type";

import { pipe } from "@/middlewares/pages/utils/pipe";

import { checkSingleQuery } from "../common/queryValidation";

interface LandLocation extends Params {
  x?: string;
  y?: string;
  z?: string;
}

interface LandPaginationQuery extends Query {
  range?: string | string[];
}

type Req = CustomIncomingMessage<LandLocation, LandPaginationQuery>;

const checkLandLocationType: Middleware<Req> = async (req) => {
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

const checkLandQuery = pipe<Req>(
  /** NOTE: 땅 범위 query */
  checkSingleQuery({
    queryName: "range",
    defaultSingleQuery: 9,
    validationMap: {
      5: true,
      9: true,
      15: true,
      25: true,
    },
  }),
);

export const checkLand = pipe<Req>(checkLandLocationType, checkLandQuery);
