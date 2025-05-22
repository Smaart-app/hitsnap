export default function ArticleCard({ title, excerpt, image, href }) {
  return (
    <article className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col md:flex-row max-w-xl mx-auto">
      {image && (
        <div className="md:w-1/2 w-full max-h-64 md:max-h-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-64 md:h-full object-cover object-center"
          />
        </div>
      )}

      <div className="flex flex-col justify-between p-4 md:w-1/2">
        <div>
          <h2 className="text-lg font-bold mb-2">{title}</h2>
          <p className="text-sm text-zinc-600 line-clamp-4">{excerpt}</p>
        </div>
        <a
          href={href}
          className="mt-4 text-[#50c7c2] font-semibold hover:underline text-sm"
        >
          Διάβασε περισσότερα →
        </a>
      </div>
    </article>
  );
}
