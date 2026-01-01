export async function onRequestPost({ request }) {
  const data = await request.json().catch(() => ({}));

  // Simple deterministic “summary” to prove Functions are working
  const summary =
`Risk Clarity Intake (Test)
Company: ${data.company_type || "—"} | ${data.industry || "—"} | ${data.geography || "—"}
Stack: ${data.cloud_stack || "—"} | Sensitivity: ${data.data_sensitivity || "—"} | Crypto-adjacent: ${data.crypto_adjacent || "—"}
Reg concern: ${data.reg_concern || "—"} | Audit/change: ${data.audit_event || "—"}
Visibility concerns: ${Array.isArray(data.vis_concerns) ? data.vis_concerns.join(", ") : (data.vis_concerns || "—")}
Prompt: ${data.prompt || "—"}
Reply-to: ${data.reply_to || "—"}
`;

  return new Response(JSON.stringify({ summary }), {
    headers: { "Content-Type": "application/json" },
  });
}
