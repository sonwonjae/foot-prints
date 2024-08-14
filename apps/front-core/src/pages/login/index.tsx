import type { CustomIncomingMessage, Params } from "@/middlewares/pages/type";
import type { ServerResponse } from "http";

import { createRouter } from "next-connect";

import { makeGetServerSideProps } from "@/middlewares/pages/common/makeGetServerSideProps";

interface LoginParams extends Params {}

const router = createRouter<
  CustomIncomingMessage<LoginParams>,
  ServerResponse
>();

router.get(async () => {
  return { props: {} };
});

export const getServerSideProps = makeGetServerSideProps(router);

export default function Page() {
  const gitHubLogin = () => {
    window.location.replace(
      `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_OAUTH_APP_CLIENT_ID}&scope=repo user`,
    );
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button type="button" onClick={gitHubLogin}>
        github login
      </button>
      {/* FIXME: logout 구현 필요 */}
      {/* <a href="/api/v1/auth/logout">logout</a> */}
    </div>
  );
}
