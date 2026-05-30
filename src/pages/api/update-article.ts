// src/pages/api/update-article.ts
import type { APIRoute } from "astro";
import { getBackend } from "@/lib/backend";
import type { Article } from "@/lib/backend/types";

export const prerender = false;

async function parseBody(request: Request): Promise<Record<string, any>> {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const form = await request.formData();
    const data: Record<string, any> = {};

    for (const [key, value] of form.entries()) {
      data[key] = value;
    }

    return data;
  }

  throw new Error(`Unsupported Content-Type: ${contentType || "(none)"}`);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const backend = getBackend();

    const session = await backend.auth.getSession();
    if (!session.userId) {
      return new Response(
        JSON.stringify({ article: null, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let data: Record<string, any>;

    try {
      data = await parseBody(request);
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          article: null,
          error: err?.message || "Unsupported Content-Type",
        }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let {
      id = "",
      slug = "",
      title = "",
      excerpt = "",
      content = "",
      cover_image = "",
      lang = "",
      published = false,
      publish_date = "",
    } = data;

    const cleanSlug = String(slug || id || "").trim();
    const cleanLang = String(lang || "").trim();

    if (!cleanSlug) {
      return new Response(
        JSON.stringify({ article: null, error: "Missing slug" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!cleanLang || cleanLang.length < 2) {
      return new Response(
        JSON.stringify({
          article: null,
          error: "Λείπει ή είναι λάθος το lang code!",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!title || typeof title !== "string") {
      return new Response(
        JSON.stringify({ article: null, error: "Missing title" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (typeof content !== "string") {
      return new Response(
        JSON.stringify({ article: null, error: "Missing content" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (typeof published === "string") {
      published = published === "true";
    }

    published = !!published;

    const nowIso = new Date().toISOString();
    const publishIso = publish_date
      ? new Date(publish_date).toISOString()
      : nowIso;

    let status: Article["status"] = "draft";

    if (published) {
      status = publishIso > nowIso ? "scheduled" : "published";
    }

    const existing = await backend.articles.get(cleanSlug, cleanLang);

    const article: Article = {
      id: existing?.id || String(id || cleanSlug).trim(),
      slug: cleanSlug,
      title: String(title).trim(),
      language: cleanLang,
      excerpt: excerpt ? String(excerpt) : "",
      coverImage: cover_image ? String(cover_image).trim() : "",
      body: String(content || ""),
      publishDate: publishIso,
      status,
      tags: existing?.tags || [],
    };

    const saved = await backend.articles.upsert(article);

    return new Response(
      JSON.stringify({
        article: {
          id: saved.id,
          slug: saved.slug,
          lang: saved.language,
        },
        error: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("[update-article] error:", err);

    return new Response(
      JSON.stringify({
        article: null,
        error: err?.message || "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};