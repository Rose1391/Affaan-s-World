// Affaan's World — send due reminders as Web Push.
// Called every 5 minutes by pg_cron (see supabase/reminders.sql) with the x-cron-key header.
// Keys live in Supabase Vault (reminder_vapid_public / reminder_vapid_private / reminder_cron_key) and are read
// through public.reminder_secrets(), which only the service role may call. SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are provided by the platform and never leave the server.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const WINDOW_MS = 6 * 3600e3;          // a reminder missed by more than 6 hours is dropped, not sent late

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: keys, error: kerr } = await db.rpc("reminder_secrets");
  if (kerr || !keys?.reminder_cron_key) return new Response("not configured", { status: 500 });
  if (req.headers.get("x-cron-key") !== keys.reminder_cron_key) return new Response("forbidden", { status: 403 });
  webpush.setVapidDetails("mailto:noreply@affaans-world.app", keys.reminder_vapid_public, keys.reminder_vapid_private);
  const { data: devices, error } = await db.from("push_devices").select("endpoint, sub, schedule, sent");
  if (error) return new Response(error.message, { status: 500 });
  const now = Date.now(); let sent = 0, gone = 0, failed = 0;
  for (const d of devices ?? []) {
    const done: Record<string, number> = d.sent ?? {};
    const due = (d.schedule ?? []).filter((x: any) => { const t = Date.parse(x.at); return t <= now && now - t < WINDOW_MS && !done[x.id]; }).slice(0, 10);
    if (!due.length) continue;
    let dead = false;
    for (const it of due) {
      try { await webpush.sendNotification(d.sub, JSON.stringify(it), { TTL: 6 * 3600, urgency: "high" }); done[it.id] = now; sent++; }
      catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) { dead = true; break; } failed++; }
    }
    if (dead) { await db.from("push_devices").delete().eq("endpoint", d.endpoint); gone++; continue; }
    for (const k of Object.keys(done)) if (now - done[k] > 60 * 864e5) delete done[k];
    await db.from("push_devices").update({ sent: done }).eq("endpoint", d.endpoint);
  }
  return Response.json({ devices: devices?.length ?? 0, sent, gone, failed });
});
