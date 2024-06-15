import "@/styles/globals.css";
import "@foot-prints/markdown/styles.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
