export default function ArticleCard({ title, excerpt, slug }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition">
      <div>
        <h2 className="text-xl font-semibold mb-3 text-[#1a1a1a] dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
          {excerpt}
        </p>
      </div>
      <a
        href={`/blog/${slug}`}
        className="mt-4 inline-block text-[#50c7c2] font-semibold hover:underline"
      >
        Διάβασε περισσότερα →
      </a>
    </div>
  );
}
