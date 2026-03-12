import type { Client } from "@opensearch-project/opensearch";

import { CONTENT_INDEX_MAPPING } from "./mapping";

function indexExists(
  existsResponse: { body?: boolean } | boolean
): boolean {
  if (typeof existsResponse === "boolean") return existsResponse;
  const body = existsResponse.body;
  return typeof body === "boolean" ? body : Boolean(body);
}

export async function ensureSearchIndex(
  client: Client,
  indexName: string
): Promise<void> {
  try {
    const exists = await client.indices.exists({
      index: indexName,
    }) as { body?: boolean } | boolean;
    if (indexExists(exists)) {
      return;
    }
  } catch {
    // Index may not exist; proceed to create
  }
  try {
    await client.indices.create({
      index: indexName,
      body: CONTENT_INDEX_MAPPING,
    });
  } catch (err: unknown) {
    const msg = err && typeof err === "object" && "body" in err
      ? String((err as { body?: unknown }).body)
      : String(err);
    if (
      msg.includes("resource_already_exists_exception") ||
      msg.includes("already exists")
    ) {
      return; // Idempotent: index created by another request
    }
    throw err;
  }
}
