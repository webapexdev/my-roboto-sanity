import { env } from "@workspace/env/server";
import {
  getOpenSearchClient,
  syncBlogsToOpenSearch,
  syncPokedexToOpenSearch,
} from "@/lib/opensearch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const secret = env.SEARCH_SYNC_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const headerSecret = request.headers.get("x-sync-secret");
    if (bearer !== secret && headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const client = getOpenSearchClient();
  if (!client) {
    return NextResponse.json(
      { error: "OpenSearch not configured" },
      { status: 503 }
    );
  }

  try {
    const [blogResult, pokedexResult] = await Promise.all([
      syncBlogsToOpenSearch(client),
      syncPokedexToOpenSearch(client),
    ]);
    return NextResponse.json({
      ok: true,
      blog: blogResult,
      pokedex: pokedexResult,
    });
  } catch (err) {
    console.error("[search/sync] Error:", err);
    return NextResponse.json(
      { error: "Sync failed", details: String(err) },
      { status: 500 }
    );
  }
}
