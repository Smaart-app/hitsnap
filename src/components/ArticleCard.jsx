export default function ArticleCard({
  title,
  excerpt,
  image,
  href,
  altHref,
  lang = 'el',
  icon = null,
}) {
  // Emoji/σημαία ανά γλώσσα (μπορείς να αλλάξεις ή να περάσεις το δικό σου icon)
  const langIcon =
    lang === 'en' ? '🇬🇧'
    : lang === 'el' ? '🏠'
    : lang === 'nl' ? '🇳🇱'
    : lang === 'fr' ? '🇫🇷'
    : lang === 'de' ? '🇩🇪'
    : '🧩';

  const readMoreText = lang === 'en' ? 'Read more →' : 'Διαβάστε περισσότερα →';
  const altLangText = lang === 'en' ? 'View in Greek →' : 'Δες και στα Αγγλικά →';

  return (
    <article
      className="
        bg-white rounded-2xl sm:rounded-3xl
        shadow-md hover:shadow-xl
        transition-transform duration-150
        hover:scale-105
        overflow-hidden w-full max-w-screen-sm sm:max-w-xl mx-auto flex flex-col
        border border-zinc-100 hover:border-[#50c7c2]/30
        mb-8
      "
      style={{ minHeight: "280px" }}
    >
      {image && (
        <div className="w-full overflow-hidden" style={{ aspectRatio: "3/2", maxHeight: 260 }}>
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-center rounded-t-2xl"
            loading="lazy"
            style={{ display: 'block', aspectRatio: "3/2", maxHeight: 260 }}
          />
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon ?? langIcon}</span>
          <h2 className="text-lg sm:text-xl font-extrabold mb-0 text-zinc-800 tracking-tight">
            {title}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-zinc-600 line-clamp-3 leading-relaxed mb-2">
          {excerpt}
        </p>

        <div className="mt-2 flex flex-col gap-1 text-sm text-center sm:text-left">
          <a
            href={href}
            className="text-[#50c7c2] font-bold hover:underline text-left hover:tracking-wider transition-all inline-block"
            style={{ width: 'fit-content' }}
          >
            {readMoreText}
          </a>
          {altHref && (
            <a
              href={altHref}
              className="text-zinc-500 hover:text-[#50c7c2] transition text-left inline-block"
              style={{ width: 'fit-content' }}
            >
              {altLangText}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
