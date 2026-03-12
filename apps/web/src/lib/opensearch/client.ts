import { Client } from "@opensearch-project/opensearch";
import { env } from "@workspace/env/server";

let clientInstance: Client | null = null;

/**
 * Returns an OpenSearch client when OPENSEARCH_NODE is configured; otherwise null.
 * Used to degrade gracefully when OpenSearch is unavailable.
 */
export function getOpenSearchClient(): Client | null {
  let node = env.OPENSEARCH_NODE?.trim();
  if (!node) {
    return null;
  }
  const username = env.OPENSEARCH_USERNAME?.trim();
  const password = env.OPENSEARCH_PASSWORD?.trim();
  if (username && password) {
    try {
      const u = new URL(node);
      u.username = username;
      u.password = password;
      node = u.toString();
    } catch {
      // keep node as-is if URL parse fails
    }
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
