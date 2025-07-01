import { createServerClientAstro } from './createServerClient';

export async function requireUser(Astro: any) {
  const supabase = createServerClientAstro(Astro.cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const lang = Astro.params?.lang || 'el';

  if (!user) {
    return Astro.redirect(`/${lang}/login`);
  }

  return user;
}
