import type { Config } from "tailwindcss";

import baseConfig from "@foot-prints/tailwind-config";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [baseConfig],
  plugins: [typography],
};
export default config;
