export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();
    const id = crypto.randomUUID();
    const ts = new Date().toISOString();

    // 1) Store in KV (what you already had)
    await env.INTAKES.put(id, JSON.stringify({ id, ts, payload }));

    // 2) Email it to you (Option A)
    const toEmail = env.TO_EMAIL || "intake@continuitysystems.com"; // you can override with env var
    const fromEmail = env.FROM_EMAIL || "intake@continuitysystems.com"; // must be on your domain

    const subject = `Risk Clarity Intake — ${id}`;
    const textBody = formatIntakeEmail({ id, ts, payload });

    const mailRes = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: toEmail }], dkim_domain: "continuitysystems.com" }
        ],
        from: { email: fromEmail, name: "Continuity Systems Intake" },
        subject,
        content: [{ type: "text/plain", value: textBody }]
      })
    });

    // If email fails, still return OK but include the email status
    if (!mailRes.ok) {
      const errText = await mailRes.text();
      return new Response(JSON.stringify({ ok: true, id, email_sent: false, email_error: errText }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true, id, email_sent: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function formatIntakeEmail({ id, ts, payload }) {
  const lines = [];
  lines.push("Continuity Systems — Risk Clarity Intake");
  lines.push(`Submission ID: ${id}`);
  lines.push(`Timestamp: ${ts}`);
  lines.push("");
  lines.push("=== Intake ===");
  lines.push(`Company type: ${payload.company_type || ""}`);
  lines.push(`Industry: ${payload.industry || ""}`);
  lines.push(`Geography: ${payload.geography || ""}`);
  lines.push(`Cloud stack: ${payload.cloud_stack || ""}`);
  lines.push(`Data sensitivity: ${payload.data_sensitivity || ""}`);
  lines.push(`Crypto-adjacent: ${payload.crypto_adjacent || ""}`);
  lines.push(`Reg concern: ${payload.reg_concern || ""}`);
  lines.push(`Audit/change event: ${payload.audit_event || ""}`);
  lines.push(`Visibility concerns: ${Array.isArray(payload.vis_concerns) ? payload.vis_concerns.join(", ") : (payload.vis_concerns || "")}`);
  lines.push("");
  lines.push("Prompt:");
  lines.push(payload.prompt || "");
  lines.push("");
  lines.push(`Reply-to: ${payload.reply_to || ""}`);
  lines.push("");
  lines.push("AI Summary:");
  lines.push(payload.summary || "");
  lines.push("");
  return lines.join("\n");
}
