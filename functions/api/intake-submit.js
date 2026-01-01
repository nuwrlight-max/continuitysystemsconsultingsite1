export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();
    const id = crypto.randomUUID();
    const ts = new Date().toISOString();

    await env.INTAKES.put(id, JSON.stringify({ id, ts, payload }));

    return new Response(JSON.stringify({ ok: true, id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
