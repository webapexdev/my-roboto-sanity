import {
  fetchPokemon,
  getEvolutionChainForPokemon,
  type EvolutionNode,
  type PokemonApi,
} from "@/lib/pokeapi";
import { capitalize } from "@/utils";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ name: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  try {
    const pokemon = await fetchPokemon(name);
    return {
      title: `${capitalize(pokemon.name)} | Pokedex`,
      description: `Stats, abilities, and evolution chain for ${pokemon.name}.`,
    };
  } catch {
    return { title: "Pokemon | Pokedex" };
  }
}

export default async function PokedexDetailPage({ params }: PageProps) {
  const { name } = await params;
  let pokemon: PokemonApi;
  let evolution: EvolutionNode | null = null;

  try {
    pokemon = await fetchPokemon(name);
    evolution = await getEvolutionChainForPokemon(pokemon.name);
  } catch {
    notFound();
  }

  const sprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default;
  const types = pokemon.types.map((t) => t.type.name);

  return (
    <main className="bg-background">
      <div className="container mx-auto my-16 px-4 md:px-6 max-w-4xl">
        <Link
          href="/pokedex"
          className="text-muted-foreground text-sm hover:text-foreground mb-6 inline-block"
        >
          ← Back to Pokedex
        </Link>

        <header className="flex flex-col items-center gap-4 mb-10">
          {sprite && (
            <img
              src={sprite}
              alt={pokemon.name}
              className="h-48 w-48 object-contain"
              width={192}
              height={192}
            />
          )}
          <h1 className="font-bold text-3xl capitalize">{pokemon.name}</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {types.map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize"
              >
                {t}
              </span>
            ))}
          </div>
        </header>

        <section className="mb-10">
          <h2 className="font-semibold text-lg mb-4">Base stats</h2>
          <ul className="space-y-2">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name} className="flex items-center gap-4">
                <span className="w-28 capitalize text-muted-foreground text-sm">
                  {s.stat.name.replace(/-/g, " ")}
                </span>
                <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full max-w-full"
                    style={{
                      width: `${Math.min(100, (s.base_stat / 255) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm">{s.base_stat}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-semibold text-lg mb-4">Abilities</h2>
          <ul className="flex flex-wrap gap-2">
            {pokemon.abilities.map((a) => (
              <li key={a.ability.name}>
                <span className="capitalize rounded-md bg-muted px-3 py-1 text-sm">
                  {a.ability.name.replace(/-/g, " ")}
                  {a.is_hidden && " (hidden)"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {evolution && (
          <section>
            <h2 className="font-semibold text-lg mb-4">Evolution chain</h2>
            <EvolutionTree node={evolution} currentName={pokemon.name} />
          </section>
        )}
      </div>
    </main>
  );
}

function EvolutionTree({
  node,
  currentName,
}: {
  node: EvolutionNode;
  currentName: string;
}) {
  const isCurrent = node.name === currentName;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href={`/pokedex/${node.name}`}
        className={`flex flex-col items-center gap-1 rounded-lg p-3 ${
          isCurrent ? "ring-2 ring-primary bg-muted/50" : "hover:bg-muted/50"
        }`}
      >
        <span className="font-medium capitalize">{node.name}</span>
        <span className="text-muted-foreground text-xs">#{node.id}</span>
      </Link>
      {node.evolvesTo.length > 0 && (
        <>
          <span className="text-muted-foreground">→</span>
          <div className="flex flex-wrap items-center gap-4">
            {node.evolvesTo.map((child) => (
              <EvolutionTree
                key={child.id}
                node={child}
                currentName={currentName}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
