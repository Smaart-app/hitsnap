export default function ArticleCard({  
  title,
  excerpt,
  image,
  href,
  altHref,
  lang = 'el',
}) {
  const readMoreText = lang === 'en' ? 'Read more →' : 'Διαβάστε περισσότερα →';
  const altLangText = lang === 'en' ? 'View in Greek →' : 'Δες και στα Αγγλικά →';

  return (
    <article className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg transition overflow-hidden w-full max-w-screen-sm sm:max-w-xl mx-auto flex flex-col">
      {image && (
        <div className="w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full object-cover object-center"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 p-6 sm:p-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-zinc-800">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 line-clamp-4 leading-relaxed">
            {excerpt}
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-center sm:text-left">
          <a
            href={href}
            className="text-[#50c7c2] font-semibold hover:underline"
          >
            {readMoreText}
          </a>
          {altHref && (
            <a
              href={altHref}
              className="text-zinc-500 hover:text-[#50c7c2] transition"
            >
              {altLangText}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}