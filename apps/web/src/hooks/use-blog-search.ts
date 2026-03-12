import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { Blog } from "@/types";
import { useDebounce } from "./use-debounce";

const SEARCH_DEBOUNCE_MS = 400;
const CACHE_STALE_TIME_MS = 30_000;

type SearchHit = Blog | PokedexSearchHit;
type PokedexSearchHit = { _id: string; type: "pokedex"; name: string; types?: string[] };
type SearchApiResponse = { results: SearchHit[]; total: number };

async function searchBlog(query: string, signal: AbortSignal): Promise<{
  blogs: Blog[];
  pokemon: PokedexSearchHit[];
}> {
  if (!query.trim()) {
    return { blogs: [], pokemon: [] };
  }

  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`,
    { signal }
  );

  if (response.status === 503) {
    throw new Error("Search is temporarily unavailable. Please try again later.");
  }

  if (!response.ok) {
    throw new Error("Failed to search");
  }

  const data = (await response.json()) as SearchApiResponse;
  const results = data.results ?? [];
  const blogs = results.filter((r): r is Blog => r && (r as { type?: string }).type !== "pokedex");
  const pokemon = results.filter(
    (r): r is PokedexSearchHit => Boolean(r && (r as { type?: string }).type === "pokedex")
  );
  return { blogs, pokemon };
}

export function useBlogSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const hasQuery = debouncedQuery.trim().length > 0;
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-search", debouncedQuery],
    queryFn: ({ signal }) => searchBlog(debouncedQuery, signal),
    enabled: hasQuery,
    staleTime: CACHE_STALE_TIME_MS,
  });
  const fallback = { blogs: [] as Blog[], pokemon: [] as PokedexSearchHit[] };
  const { blogs = fallback.blogs, pokemon = fallback.pokemon } = data ?? fallback;
  return {
    searchQuery,
    setSearchQuery,
    results: blogs,
    pokemon,
    isSearching: isLoading,
    error,
    hasQuery,
  };
}
