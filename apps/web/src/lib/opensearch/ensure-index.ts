import type { Client } from "@opensearch-project/opensearch";

import { CONTENT_INDEX_MAPPING } from "./mapping";

export async function ensureSearchIndex(
  client: Client,
  indexName: string
): Promise<void> {
  try {
    const exists = await client.indices.exists({ index: indexName });
    const existsBody =
      typeof (exists as { body?: boolean }).body === "boolean"
        ? (exists as { body: boolean }).body
        : Boolean((exists as { body?: unknown }).body);
    if (existsBody) {
      return;
    }
  } catch {
    // Index may not exist; proceed to create
  }
  await client.indices.create({
    index: indexName,
    body: CONTENT_INDEX_MAPPING,
  });
}
