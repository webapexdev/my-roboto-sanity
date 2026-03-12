"use client";

import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

import { BlogList } from "@/components/blog-list";
import type { Blog } from "@/types";

type PokedexHit = { _id: string; type: "pokedex"; name: string; types?: string[] };

type BlogSearchResultsProps = {
  className?: string;
  results: Blog[];
  pokemon?: PokedexHit[];
  isSearching: boolean;
  hasQuery: boolean;
  searchQuery: string;
  error?: Error | null;
};

function SearchResultsHeader({
  query,
  blogCount,
  pokemonCount,
}: {
  query: string;
  blogCount: number;
  pokemonCount: number;
}) {
  const total = blogCount + pokemonCount;
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg">Search Results for "{query}"</h2>
      <p className="text-muted-foreground text-sm">
        {total === 0
          ? "No results found"
          : `${blogCount} article${blogCount === 1 ? "" : "s"}${pokemonCount > 0 ? `, ${pokemonCount} Pokemon` : ""} found`}
      </p>
    </div>
  );
}

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="mb-2 font-medium text-foreground text-lg">
          No articles found
        </h3>
        <p className="mb-4 text-muted-foreground">
          We couldn't find any articles matching "{query}". Try adjusting your
          search terms.
        </p>
        <div className="text-muted-foreground text-sm">
          <p>Suggestions:</p>
          <ul className="mt-2 space-y-1">
            <li>• Check your spelling</li>
            <li>• Try different keywords</li>
            <li>• Use more general terms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  query,
  message,
}: {
  query: string;
  message?: string | null;
}) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="mb-2 font-medium text-destructive text-lg">
          Search failed
        </h3>
        <p className="mb-4 text-muted-foreground">
          {message ??
            `We encountered an error while searching for "${query}". Please try again.`}
        </p>
        <div className="text-muted-foreground text-sm">
          <p>If the problem persists:</p>
          <ul className="mt-2 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Refresh the page</li>
            <li>• Try again in a few moments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const LOADING_SKELETONS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
] as const;

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="mb-2 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {LOADING_SKELETONS.map((id) => (
          <div className="space-y-4" key={id}>
            <div className="aspect-video animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogSearchResults({
  className,
  results,
  pokemon = [],
  isSearching,
  hasQuery,
  searchQuery,
  error,
}: BlogSearchResultsProps) {
  if (!hasQuery) {
    return null;
  }

  if (isSearching) {
    return (
      <section className={cn("mt-8", className)}>
        <LoadingState />
      </section>
    );
  }

  const totalCount = results.length + pokemon.length;

  return (
    <section className={cn("mt-8", className)}>
      <SearchResultsHeader
        blogCount={results.length}
        pokemonCount={pokemon.length}
        query={searchQuery}
      />

      {error ? (
        <ErrorState query={searchQuery} message={error.message} />
      ) : totalCount === 0 ? (
        <EmptySearchState query={searchQuery} />
      ) : (
        <div className="space-y-10">
          {results.length > 0 && <BlogList blogs={results} />}
          {pokemon.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-base">Pokemon</h3>
              <ul className="flex flex-wrap gap-2">
                {pokemon.map((p: PokedexHit) => (
                  <li key={p._id}>
                    <Link
                      href={`/pokedex/${p.name}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium capitalize hover:bg-secondary/80"
                    >
                      {p.name}
                      {p.types && p.types.length > 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({p.types.join(", ")})
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
