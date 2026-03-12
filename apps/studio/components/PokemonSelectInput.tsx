"use client";

import { Box, Card, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { set, unset, type StringInputProps } from "sanity";
import { useCallback, useEffect, useState } from "react";

function getWebAppBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.SANITY_STUDIO_PRESENTATION_URL) {
    return process.env.SANITY_STUDIO_PRESENTATION_URL;
  }
  return "http://localhost:3000";
}

type PokedexResult = { id: string; name: string };

async function searchPokemon(q: string): Promise<PokedexResult[]> {
  const base = getWebAppBaseUrl();
  const url = `${base.replace(/\/$/, "")}/api/pokedex/search?q=${encodeURIComponent(q)}&limit=20`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json() as Promise<PokedexResult[]>;
}

export function PokemonSelectInput(props: StringInputProps) {
  const { value, onChange } = props;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokedexResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const data = await searchPokemon(q);
      setResults(data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const select = useCallback(
    (name: string) => {
      onChange(set(name));
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [onChange]
  );

  const clear = useCallback(() => {
    onChange(unset());
    setQuery("");
    setResults([]);
    setOpen(false);
  }, [onChange]);

  return (
    <Stack space={3}>
      <Flex gap={2} align="center">
        <Box flex={1}>
          <input
            type="text"
            className="sanity-input"
            placeholder="Search Pokemon by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "1px solid var(--card-border-color)",
              borderRadius: "0.25rem",
              fontSize: "1rem",
            }}
          />
        </Box>
        {value && (
          <button
            type="button"
            onClick={clear}
            style={{
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </Flex>
      {loading && (
        <Flex align="center" gap={2}>
          <Spinner />
          <Text size={1} muted>
            Searching...
          </Text>
        </Flex>
      )}
      {open && results.length > 0 && (
        <Card padding={0} radius={2} shadow={1} overflow="auto" style={{ maxHeight: 240 }}>
          <Stack padding={0}>
            {results.map((r) => (
              <Box
                key={r.id}
                padding={2}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid var(--card-border-color)",
                }}
                onClick={() => select(r.name)}
              >
                <Text size={2} style={{ textTransform: "capitalize" }}>
                  {r.name}
                </Text>
              </Box>
            ))}
          </Stack>
        </Card>
      )}
      {value && (
        <Text size={1} muted>
          Linked Pokemon: <strong style={{ textTransform: "capitalize" }}>{value}</strong>
          {" → "}
          <a
            href={`${getWebAppBaseUrl()}/pokedex/${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Pokedex
          </a>
        </Text>
      )}
    </Stack>
  );
}
