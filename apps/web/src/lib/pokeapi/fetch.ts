const BASE = "https://pokeapi.co/api/v2";
const REVALIDATE = 86_400; // 24 hours

async function fetchApi<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`PokeAPI ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

import type {
  EvolutionChainApi,
  PokemonApi,
  PokemonListResult,
  PokemonSpeciesApi,
} from "./types";

export async function fetchPokemonList(
  limit: number,
  offset: number
): Promise<PokemonListResult> {
  return fetchApi<PokemonListResult>(
    `/pokemon?limit=${limit}&offset=${offset}`
  );
}

export async function fetchPokemon(idOrName: string | number): Promise<PokemonApi> {
  return fetchApi<PokemonApi>(`/pokemon/${idOrName}`);
}

export async function fetchPokemonSpecies(
  idOrName: string | number
): Promise<PokemonSpeciesApi> {
  return fetchApi<PokemonSpeciesApi>(`/pokemon-species/${idOrName}`);
}

export async function fetchEvolutionChain(id: number): Promise<EvolutionChainApi> {
  return fetchApi<EvolutionChainApi>(`/evolution-chain/${id}`);
}

export function evolutionChainIdFromUrl(url: string): number {
  const match = url.match(/evolution-chain\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}
