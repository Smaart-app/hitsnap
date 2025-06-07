// /src/lib/requireUser.ts
import { createServerClientReadOnly } from './createServerClient';

export async function requireUser(Astro: any) {
  const supabase = createServerClientReadOnly(Astro.cookies);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return Astro.redirect('/login');
  }

  return user;
}