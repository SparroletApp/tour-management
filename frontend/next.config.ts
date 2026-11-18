
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,

    experimental: {
        agentFeedback: true,
    },

    cacheComponents: false,
    partialPrefetching: false,

    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
