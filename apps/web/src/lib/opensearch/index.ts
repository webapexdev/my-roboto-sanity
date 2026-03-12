export { getOpenSearchClient, getOpenSearchIndex } from "./client";
export { ensureSearchIndex } from "./ensure-index";
export { CONTENT_INDEX_MAPPING } from "./mapping";
export { searchContent } from "./search";
export { syncBlogsToOpenSearch } from "./sync-blogs";
export { syncPokedexToOpenSearch } from "./sync-pokedex";
export type { SearchHit, SearchResult } from "./search";
