import { fetchPokemon, fetchPokemonList } from "@/lib/pokeapi";
import type { PokemonApi } from "@/lib/pokeapi";
import { calculatePaginationMetadata } from "@/utils";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPagination } from "@/components/blog-pagination";
import { Badge } from "@workspace/ui/components/badge";

const POKEMON_PER_PAGE = 24;

export const metadata: Metadata = {
  title: "Pokedex",
  description: "Browse Pokemon with stats and evolution chains.",
};

type PageProps = { searchParams: Promise<{ page?: string }> };

export default async function PokedexPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const offset = (currentPage - 1) * POKEMON_PER_PAGE;

  const list = await fetchPokemonList(POKEMON_PER_PAGE, offset);
  if (!list.results.length && currentPage > 1) {
    notFound();
  }

  const pokemon = await Promise.all(
    list.results.map((r) => fetchPokemon(r.name))
  );

  const totalCount = list.count;
  const paginationMetadata = calculatePaginationMetadata(
    totalCount,
    currentPage,
    POKEMON_PER_PAGE
  );

  return (
    <main className="bg-background">
      <div className="container mx-auto my-16 px-4 md:px-6">
        <header className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="font-bold text-3xl sm:text-4xl">Pokedex</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse Pokemon with stats and evolution chains. Data from PokeAPI.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pokemon.map((p) => (
            <PokedexCard key={p.id} pokemon={p} />
          ))}
        </ul>

        {paginationMetadata.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <BlogPagination
              basePath="/pokedex"
              currentPage={paginationMetadata.currentPage}
              hasNextPage={paginationMetadata.hasNextPage}
              hasPreviousPage={paginationMetadata.hasPreviousPage}
              totalPages={paginationMetadata.totalPages}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function PokedexCard({ pokemon }: { pokemon: PokemonApi }) {
  const sprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    "";
  const types = pokemon.types.map((t) => t.type.name);
  const stats = pokemon.stats.slice(0, 6);

  return (
    <li>
      <Link
        href={`/pokedex/${pokemon.name}`}
        className="block rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
      >
        <div className="flex flex-col items-center gap-3">
          {sprite ? (
            <img
              src={sprite}
              alt={pokemon.name}
              className="h-24 w-24 object-contain"
              width={96}
              height={96}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-muted" />
          )}
          <span className="font-semibold capitalize text-lg">{pokemon.name}</span>
          <div className="flex flex-wrap justify-center gap-1">
            {types.map((t) => (
              <Badge key={t} variant="secondary" className="capitalize">
                {t}
              </Badge>
            ))}
          </div>
          <dl className="grid w-full grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground text-xs">
            {stats.map((s) => (
              <div key={s.stat.name} className="flex justify-between">
                <dt className="capitalize">{s.stat.name.replace(/-/g, " ")}</dt>
                <dd>{s.base_stat}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>
    </li>
  );
}
