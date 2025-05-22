export default function ArticleCard({ title, excerpt, image, href }) {
  return (
    <article className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col md:flex-row">
      {image && (
        <div className="md:w-1/3 w-full h-48 md:h-auto overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col justify-between p-4 md:w-2/3">
        <div>
          <h2 className="text-lg font-bold mb-2">{title}</h2>
          <p className="text-sm text-zinc-600 line-clamp-4">{excerpt}</p>
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
