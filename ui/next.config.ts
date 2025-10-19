import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    quietDeps: true,
    silenceDeprecations: [
      "import",
      "legacy-js-api",
    ],
  },
};

export default nextConfig;
