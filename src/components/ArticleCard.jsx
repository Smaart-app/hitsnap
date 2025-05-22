export default function ArticleCard({ title, excerpt, image, href }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-4 flex flex-col hover:shadow-lg transition">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      )}

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2 text-[#1a1a1a] dark:text-white leading-snug">
            {title}
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 line-clamp-4">
            {excerpt}
          </p>
        </div>

        <a
          href={href}
          className="mt-4 inline-block text-[#50c7c2] font-semibold hover:underline"
        >
          Διάβασε περισσότερα →
        </a>
      </div>
    </div>
  );
}
