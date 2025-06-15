export const prerender = false;

export async function get({ params }) {
  const { slug } = params;
  console.log("[DYNAMIC TEST] Route activated for slug:", slug);

  return new Response(`✅ Route works for slug: ${slug}`);
}
