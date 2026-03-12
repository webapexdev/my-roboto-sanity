import { fetchPokemonList } from "@/lib/pokeapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const CACHE_MAX_AGE = 86_400; // 24h
const LIST_LIMIT = 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const limit = Math.min(50, Number(searchParams.get("limit")) || 20);

  const list = await fetchPokemonList(LIST_LIMIT, 0);
  const names = q
    ? list.results
        .filter((r) => r.name.includes(q))
        .slice(0, limit)
        .map((r) => ({ id: r.name, name: r.name }))
    : list.results.slice(0, limit).map((r) => ({ id: r.name, name: r.name }));

  const res = NextResponse.json(names);
  res.headers.set("Cache-Control", `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate`);
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
