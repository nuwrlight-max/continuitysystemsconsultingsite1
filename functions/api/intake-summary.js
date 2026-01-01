export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();

    const prompt = `
You are an assessment clarifier for "Privacy-by-Design Compliance & Digital Risk Architecture".
Do NOT provide fixes, prescriptions, or legal advice. Only convert intake answers into executive clarity.

Return a concise structured summary with these headings:
- Scope
- Pressure Signals
- Likely Risk Concentration (high-level, no prescriptions)
- Decision Constraints
- Clarifying Questions (3–6)
- Recommended Next Step (one sentence: "Risk clarity session")

Intake JSON:
${JSON.stringify(payload, null, 2)}
`.trim();

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 500
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(JSON.stringify({ error: "OpenAI failed", details: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await r.json();
    return new Response(JSON.stringify({ summary: data.output_text || "" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
