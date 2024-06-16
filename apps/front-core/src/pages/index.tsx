import { Inter } from "next/font/google";

import { Markdownarea } from "@foot-prints/markdown";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	const [text, setText] = useState('');

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Markdownarea value={text} setValue={setText} />
    </main>
  );
}
