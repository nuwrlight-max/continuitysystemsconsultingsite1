export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY env var" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const input = await request.json();

    // Keep the AI role: clarify + synthesize, NOT prescribe.
    const system = [
      "You are an executive risk-intake summarizer for a consulting firm.",
      "Your job: synthesize the intake into an executive-ready brief.",
      "Do NOT provide legal advice. Do NOT provide step-by-step remediation.",
      "Do NOT mention politics, surveillance, or speculation. Stay neutral and professional.",
      "Use concise, high-credibility language.",
      "Output must be plain text.",
      "",
      "Format exactly:",
      "1) Snapshot (1 sentence)",
      "2) Signals (3 bullets)",
      "3) Primary risks (3 bullets)",
      "4) Clarifying questions (3 bullets)",
      "5) Next-step framing (1 sentence, non-promissory)",
    ].join("\n");

    const user = [
      "Risk Clarity Intake (structured form data):",
      JSON.stringify(input, null, 2)
    ].join("\n");

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 450,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ error: "OpenAI request failed", detail: errText }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const summary = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Server error", detail: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
