import type { APIRoute } from "astro";
import { createServerClientWithCookies } from "../../lib/createServerClient.ts";

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json();
  console.log("Request body:", body);

  const supabase = createServerClientWithCookies(cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Για αρχή απλά επιστρέφουμε το user email
  console.log("User authenticated:", user.email);

  return new Response(`User authenticated: ${user.email}`, { status: 200 });
};