import type { Client } from "@opensearch-project/opensearch";

export type SearchHit = {
  _id: string;
  type: "blog" | "pokedex";
  title?: string | null;
  description?: string | null;
  content?: string | null;
  slug?: string | null;
  publishedAt?: string | null;
  orderRank?: string | null;
  image?: unknown;
  authors?: unknown;
  name?: string;
  types?: string[];
  baseStats?: unknown;
  evolutionChain?: unknown;
  sprite?: string | null;
};

export type SearchResult = {
  results: SearchHit[];
  total: number;
};

export async function searchContent(
  client: Client,
  indexName: string,
  query: string,
  options: { type?: "blog" | "pokedex"; limit?: number } = {}
): Promise<SearchResult> {
  const { type, limit = 20 } = options;
  const q = query.trim();
  const qLower = q.toLowerCase();

  // Match full tokens (and fuzzy) OR prefix of tokens so "secu" matches "secured"
  const textFields = ["title^2", "description", "content", "name^2", "types"];
  const must: Array<{ [key: string]: unknown }> = [
    {
      bool: {
        should: [
          {
            multi_match: {
              query: q,
              fields: textFields,
              fuzziness: "AUTO",
            },
          },
          ...(qLower.length >= 2
            ? [
                { prefix: { title: qLower } },
                { prefix: { description: qLower } },
                { prefix: { content: qLower } },
                { prefix: { name: qLower } },
              ]
            : []),
        ],
        minimum_should_match: 1,
      },
    },
  ];
  if (type) {
    must.push({ term: { type } });
  }

  const response = await client.search<SearchHit>({
    index: indexName,
    body: {
      size: limit,
      query: { bool: { must } },
      _source: true,
    },
  });

  const raw = response.body as {
    hits?: { hits?: Array<{ _source: SearchHit; _id: string }>; total?: number | { value: number } };
  };
  const hits = raw.hits?.hits ?? [];
  const total =
    typeof raw.hits?.total === "number"
      ? raw.hits.total
      : (raw.hits?.total as { value?: number })?.value ?? 0;

  const results = hits.map((h) => ({ ...h._source, _id: h._id }));

  return { results, total };
}
