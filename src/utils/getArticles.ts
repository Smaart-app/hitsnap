import { getCollection, type CollectionEntry } from "astro:content";

type ArticleEntry = CollectionEntry<"articles">;

// ✅ Φέρνει όλα τα άρθρα μιας γλώσσας (el ή en)
export async function getArticles(
  lang: "el" | "en"
): Promise<ArticleEntry[]> {
  const allArticles = await getCollection("articles");

  return allArticles
    .filter((a: ArticleEntry) => a.data.lang === lang && a.data.published)
    .sort(
      (a: ArticleEntry, b: ArticleEntry) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}

// ✅ Φέρνει ένα άρθρο συγκεκριμένο με βάση slug και lang
export async function getArticle(
  slug: string,
  lang: "el" | "en"
): Promise<ArticleEntry | undefined> {
  const allArticles = await getCollection("articles");

  return allArticles.find(
    (a: ArticleEntry) => a.slug === slug && a.data.lang === lang
  );
}
