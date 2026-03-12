/** PokeAPI response types (subset we use). */

export type NamedResource = { name: string; url: string };

export type PokemonListResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<NamedResource>;
};

export type PokemonTypeSlot = {
  slot: number;
  type: NamedResource;
};

export type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: NamedResource;
};

export type PokemonAbility = {
  ability: NamedResource;
  is_hidden: boolean;
  slot: number;
};

export type PokemonSprites = {
  front_default: string | null;
  front_shiny: string | null;
  other?: {
    "official-artwork"?: { front_default?: string; front_shiny?: string };
  };
};

export type PokemonApi = {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: NamedResource;
};

export type PokemonSpeciesApi = {
  id: number;
  name: string;
  evolution_chain: { url: string };
};

export type EvolutionChainLink = {
  species: NamedResource;
  evolves_to: EvolutionChainLink[];
  evolution_details?: Array<{
    min_level: number | null;
    item: NamedResource | null;
    trigger: NamedResource;
  }>;
};

export type EvolutionChainApi = {
  id: number;
  chain: EvolutionChainLink;
};
