import { fetchPokemon, fetchPokemonList } from "@/lib/pokeapi";
import type { Client } from "@opensearch-project/opensearch";

import { ensureSearchIndex } from "./ensure-index";
import { getOpenSearchIndex } from "./client";

const BATCH_SIZE = 50;

export async function syncPokedexToOpenSearch(client: Client): Promise<{
  indexed: number;
  error?: string;
}> {
  const indexName = getOpenSearchIndex();
  await ensureSearchIndex(client, indexName);

  const list = await fetchPokemonList(500, 0);
  const names = list.results.map((r) => r.name);
  let indexed = 0;

  await client.deleteByQuery({
    index: indexName,
    body: { query: { term: { type: "pokedex" } } },
    refresh: true,
  });

  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, i + BATCH_SIZE);
    const pokemon = await Promise.all(batch.map((name) => fetchPokemon(name)));
    const bulkBody = pokemon.flatMap((p) => {
      const sprite =
        p.sprites.other?.["official-artwork"]?.front_default ??
        p.sprites.front_default ??
        "";
      const types = p.types.map((t) => t.type.name);
      const docId = `pokedex-${p.id}`;
      const doc = {
        type: "pokedex",
        name: p.name,
        title: p.name,
        description: `${p.name} Pokemon. Types: ${types.join(", ")}.`,
        types,
        baseStats: p.stats.map((s) => ({
          name: s.stat.name,
          baseStat: s.base_stat,
        })),
        sprite,
      };
      return [{ index: { _index: indexName, _id: docId } }, doc];
    });
    await client.bulk({ refresh: i + BATCH_SIZE >= names.length, body: bulkBody });
    indexed += pokemon.length;
  }

  return { indexed };
}
