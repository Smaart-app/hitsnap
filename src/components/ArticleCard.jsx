export default function ArticleCard({ title, excerpt, image, href }) {
  return (
    <article className="rounded-xl overflow-hidden bg-white shadow-md transition hover:shadow-lg flex flex-col h-full">
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm text-zinc-600 line-clamp-3">{excerpt}</p>
        </div>
        <a
          href={href}
          className="mt-4 text-[#50c7c2] font-semibold hover:underline text-sm"
        >
          Διαβάσε περισσότερα →
        </a>
      </div>
    </article>
  );
}
