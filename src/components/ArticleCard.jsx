export default function ArticleCard({ title, excerpt, image, href, lang = 'el' }) {
  const readMoreText = lang === 'en' ? 'Read more →' : 'Διαβάστε περισσότερα →';

  return (
    <article className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden w-full max-w-screen-sm sm:max-w-xl mx-auto flex flex-col">
      {image && (
        <div className="w-full max-h-[250px] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-[250px] object-cover object-center"
          />
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-zinc-800">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 line-clamp-4 leading-relaxed">
            {excerpt}
          </p>
        </div>

        <a
          href={href}
          className="inline-block text-[#50c7c2] font-semibold hover:underline text-sm"
        >
          {readMoreText}
        </a>
      </div>
    </article>
  );
}
