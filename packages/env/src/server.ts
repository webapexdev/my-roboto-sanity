import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  server: {
    SANITY_API_READ_TOKEN: z.string().min(1),
    SANITY_API_WRITE_TOKEN: z.string().min(1),
    /** OpenSearch (optional). When unset or empty, search API returns 503 and UI degrades gracefully. */
    OPENSEARCH_NODE: z.string().optional(),
    OPENSEARCH_INDEX: z.string().min(1).default("content"),
    /** Secret for protecting POST /api/search/sync (webhook/cron). Optional if sync is script-only. */
    SEARCH_SYNC_SECRET: z.string().min(1).optional(),
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },

  extends: [vercel()],
});

export { env };
