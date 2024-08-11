import type {
  Middleware,
  Query,
  CustomIncomingMessage,
} from "@/middlewares/pages/type";

import QueryString from "query-string";

export const checkSingleQuery = <
  Req extends CustomIncomingMessage & { query: Query },
>({
  queryName = "",
  defaultSingleQuery = "",
  validationMap = {},
  useSingleQuery = true,
}: {
  queryName: string;
  defaultSingleQuery?: string;
  validationMap?: { [key: string]: boolean };
  useSingleQuery?: boolean;
}) => {
  const middleware: Middleware<Req> = async (req) => {
    if (!queryName) {
      throw new Error("queryName에 빈 스트링은 허용하지 않습니다.");
    }

    const targetQuery = req.query?.[queryName];
    const hasValidationMap = Object.keys(validationMap).length !== 0;

    if (
      hasValidationMap &&
      typeof validationMap[defaultSingleQuery] === "undefined"
    ) {
      throw new Error(
        "defaultSingleQuery는 반드시 validationMap에 포함되어 있어야 합니다.",
      );
    }

    const getSingleQueryValidation = () => {
      /** NOTE: useSingleQuery가 false면 targetQuery가 undefined일때까지 invalid */
      if (!useSingleQuery) {
        return {
          isValid: typeof targetQuery === "undefined",
          [queryName]: undefined,
        };
      }

      /** NOTE: 배열 쿼리는 invalid */
      if (Array.isArray(targetQuery)) {
        return { isValid: false, [queryName]: defaultSingleQuery };
      }

      /** NOTE: validationMap이 있으면 targetQuery에 따라 validation 반환 */
      if (hasValidationMap) {
        if (targetQuery) {
          const isValid = typeof validationMap[targetQuery] !== "undefined";

          return {
            isValid,
            [queryName]: isValid ? targetQuery : defaultSingleQuery,
          };
        } else {
          return {
            isValid: false,
            [queryName]: defaultSingleQuery,
          };
        }
      }

      /** NOTE: 모든 케이스를 통과했으면 valid */
      return {
        isValid: true,
        [queryName]: targetQuery ?? defaultSingleQuery,
      };
    };

    const singleQueryValidation = getSingleQueryValidation();
    const isInvalidSingleQuery = !singleQueryValidation.isValid;

    if (isInvalidSingleQuery) {
      /** NOTE: next 특성상 req.query에 req.params도 포함하고 있어서 params는 제외해줘야함 */
      const onlyQuery = Object.entries(req.query || {}).reduce(
        (acc, [key, value]) => {
          if (typeof (req.params || {})[key] !== "undefined") {
            return acc;
          }

          return {
            ...acc,
            [key]: value,
          };
        },
        {},
      );

      const validQuery = {
        ...onlyQuery,
        [queryName]: singleQueryValidation[queryName],
      };

      const validQueryString = `?${QueryString.stringify(validQuery)}`;

      return {
        redirect: {
          destination: `${req.pathname}${validQueryString}`,
          permanent: true,
        },
      };
    }
    return {
      props: {},
    };
  };

  return middleware;
};
