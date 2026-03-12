import {
  getOpenSearchClient,
  getOpenSearchIndex,
  searchContent,
} from "@/lib/opensearch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type") as "blog" | "pokedex" | null;

  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    );
  }

  const client = getOpenSearchClient();
  if (!client) {
    return NextResponse.json(
      { error: "Search is temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    const indexName = getOpenSearchIndex();
    const { results, total } = await searchContent(client, indexName, q.trim(), {
      type: type ?? undefined,
      limit: 50,
    });

    return NextResponse.json({
      results,
      total,
    });
  } catch (err) {
    console.error("[search] OpenSearch error:", err);
    return NextResponse.json(
      { error: "Search is temporarily unavailable" },
      { status: 503 }
    );
  }
}
