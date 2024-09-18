import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FootprintsIcon } from "lucide-react";
import { useState } from "react";

import { Toaster } from "@/shad-cn/components/ui/sonner";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        icons={{
          success: <FootprintsIcon />,
        }}
      />
    </QueryClientProvider>
  );
}
