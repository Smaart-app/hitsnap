export default function ArticleCard({ title, excerpt, image, href, lang = 'el' }) {
  const readMoreText = lang === 'en' ? 'Read more →' : 'Διάβασε περισσότερα →';

  return (
    <article className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden max-w-xl mx-auto flex flex-col">
      {image && (
        <div className="w-full max-h-[250px] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-[250px] object-cover object-center"
          />
        </div>
      )}

      <div className="flex flex-col justify-between p-6">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-zinc-800">{title}</h2>
          <p className="text-base text-zinc-600 line-clamp-4 leading-relaxed">{excerpt}</p>
        </div>

        <a
          href={href}
          className="mt-4 inline-block text-[#50c7c2] font-semibold hover:underline text-sm"
        >
          {readMoreText}
        </a>
      </div>
    </article>
  );
}
