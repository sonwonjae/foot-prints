import { Markdownarea } from "@foot-prints/markdown";
import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [text, setText] = useState("");

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <Markdownarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          setText(e.currentTarget.value);
        }}
      />
      <input
        className="text-black h-full w-full"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
    </main>
  );
}
