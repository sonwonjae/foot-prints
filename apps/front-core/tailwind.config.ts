import type { Config } from "tailwindcss";
import baseConfig from "@foot-prints/tailwind-config";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [baseConfig],
};
export default config;
