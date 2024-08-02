import type { GetServerSideProps } from "next";

import { dehydrate, QueryClient } from "@tanstack/react-query";

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

export const getServerSideProps = (async () => {
  const queryClient = new QueryClient();

  return { props: { dehydratedState: dehydrate(queryClient) } };
}) satisfies GetServerSideProps;
