import { Client } from "@opensearch-project/opensearch";
import { env } from "@workspace/env/server";

let clientInstance: Client | null = null;

/**
 * Returns an OpenSearch client when OPENSEARCH_NODE is configured; otherwise null.
 * Used to degrade gracefully when OpenSearch is unavailable.
 */
export function getOpenSearchClient(): Client | null {
  const node = env.OPENSEARCH_NODE?.trim();
  if (!node) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = new Client({
      node,
      ...(node.startsWith("https")
        ? {}
        : { ssl: { rejectUnauthorized: false } }),
    });
  }
  return clientInstance;
}

export function getOpenSearchIndex(): string {
  return env.OPENSEARCH_INDEX;
}
