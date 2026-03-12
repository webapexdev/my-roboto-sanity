/**
 * Index mapping for unified search (blog + pokedex).
 */
export const CONTENT_INDEX_MAPPING = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        default: { type: "standard" },
        text_search: {
          type: "custom",
          tokenizer: "standard",
          filter: ["lowercase", "asciifolding"],
        },
      },
    },
  },
  mappings: {
    properties: {
      type: { type: "keyword" },
      _id: { type: "keyword" },
      title: {
        type: "text",
        analyzer: "text_search",
        fields: { keyword: { type: "keyword" } },
      },
      description: {
        type: "text",
        analyzer: "text_search",
      },
      slug: { type: "keyword" },
      publishedAt: { type: "date" },
      orderRank: { type: "keyword" },
      image: { type: "object", enabled: false },
      authors: { type: "object", enabled: false },
      name: { type: "keyword" },
      types: { type: "keyword" },
      baseStats: { type: "object", enabled: false },
      evolutionChain: { type: "object", enabled: false },
      sprite: { type: "keyword" },
    },
  },
} as const;
