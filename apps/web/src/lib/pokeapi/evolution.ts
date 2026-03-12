import type { EvolutionChainLink } from "./types";
import { fetchEvolutionChain, fetchPokemonSpecies } from "./fetch";
import { evolutionChainIdFromUrl } from "./fetch";

export type EvolutionNode = {
  name: string;
  id: number;
  evolvesTo: EvolutionNode[];
};

function extractIdFromSpeciesUrl(url: string): number {
  const m = url.match(/pokemon-species\/(\d+)\/?$/);
  return m ? Number(m[1]) : 0;
}

function mapChain(link: EvolutionChainLink): EvolutionNode {
  const id = extractIdFromSpeciesUrl(link.species.url);
  return {
    id,
    name: link.species.name,
    evolvesTo: (link.evolves_to ?? []).map(mapChain),
  };
}

export async function getEvolutionChainForPokemon(
  pokemonIdOrName: string | number
): Promise<EvolutionNode | null> {
  const species = await fetchPokemonSpecies(pokemonIdOrName);
  const url = species.evolution_chain?.url;
  if (!url) return null;
  const chainId = evolutionChainIdFromUrl(url);
  if (!chainId) return null;
  const chain = await fetchEvolutionChain(chainId);
  return mapChain(chain.chain);
}
