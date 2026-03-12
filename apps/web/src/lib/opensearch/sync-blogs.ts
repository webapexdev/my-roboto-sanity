import { sanityFetch } from "@workspace/sanity/live";
import { queryAllBlogDataForSearch } from "@workspace/sanity/query";
import type { Client } from "@opensearch-project/opensearch";

import { ensureSearchIndex } from "./ensure-index";
import { getOpenSearchIndex } from "./client";

type BlogDoc = {
  _id: string;
  _type: string;
  title: string | null;
  description: string | null;
  slug: string | null;
  orderRank: string | null;
  image: unknown;
  publishedAt: string | null;
  authors: { _id: string; name: string | null; position: string | null; image: unknown } | null;
};

function toSearchDoc(blog: BlogDoc) {
  return {
    type: "blog",
    title: blog.title ?? "",
    description: blog.description ?? "",
    slug: blog.slug ?? "",
    publishedAt: blog.publishedAt ?? null,
    orderRank: blog.orderRank ?? null,
    image: blog.image ?? null,
    authors: blog.authors ?? null,
  };
}

export async function syncBlogsToOpenSearch(client: Client): Promise<{
  indexed: number;
  error?: string;
}> {
  const indexName = getOpenSearchIndex();
  await ensureSearchIndex(client, indexName);

  const { data: blogs } = await sanityFetch({
    query: queryAllBlogDataForSearch,
    stega: false,
  });

  if (!blogs || !Array.isArray(blogs)) {
    return { indexed: 0, error: "No blog data from Sanity" };
  }

  await client.deleteByQuery({
    index: indexName,
    body: { query: { term: { type: "blog" } } },
    refresh: true,
  });

  if (blogs.length === 0) {
    return { indexed: 0 };
  }

  const bulkBody = blogs.flatMap((blog: BlogDoc) => {
    const doc = toSearchDoc(blog);
    return [
      { index: { _index: indexName, _id: blog._id } },
      doc,
    ];
  });

  const response = await client.bulk({
    refresh: true,
    body: bulkBody,
  });

  const body = response.body as { errors?: boolean; items?: Array<{ index?: { error?: unknown } }> };
  if (body.errors) {
    const failed = (body.items ?? []).filter((i) => i.index?.error);
    return {
      indexed: blogs.length - failed.length,
      error: failed.length > 0 ? `Bulk had ${failed.length} failures` : undefined,
    };
  }

  return { indexed: blogs.length };
}
