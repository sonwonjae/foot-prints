import { GetServerSideProps, GetServerSidePropsResult } from "next";
import QueryString from "qs";

import { apiAxios } from "@/utils/react-query";

export const makeGetServerSideProps = <PageProps extends object, Router>(
  router: Router,
) => {
  const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    params,
  }) => {
    /** NOTE: create dummy url for req.query */
    const DUMMY_URL = new URL(`http://dummy:5001${req.url ?? ""}`);

    /** FIXME: type으로 제어할 수 있게 수정가능하다면 수정 시도하기 */
    // @ts-expect-error: attach params to req.params
    req.params = params ?? {};

    /** FIXME: type으로 제어할 수 있게 수정가능하다면 수정 시도하기 */
    // @ts-expect-error: attach query to req.query
    req.query = QueryString.parse(DUMMY_URL.search.replace(/^\?/, ""));

    /** NOTE: next serverside req에는 cookie가 안 담기기 때문에 강제 cookie 주입 */
    apiAxios.defaults.headers.Cookie = req.headers.cookie!;

    /** FIXME: type으로 제어할 수 있게 수정가능하다면 수정 시도하기 */
    // @ts-expect-error: attach custom req
    return router.run(req, res) as Promise<GetServerSidePropsResult<PageProps>>;
  };

  return getServerSideProps;
};
