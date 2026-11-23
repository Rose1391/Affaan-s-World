/* Affaan's World — Supabase connection (optional).
   Fill these two values from Supabase → Project Settings → API (or paste them in
   the app under Settings → Sync & account, which overrides this file).
   ONLY the "anon"/"publishable" key belongs here — it is designed to be public and
   is protected by Row Level Security. NEVER put the service_role / secret key here. */
window.AFFAAN_CONFIG = {
  SUPABASE_URL: "https://yteazojpoyxrvvvwvxky.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_N-QIHNxvB273sNhYNCRsSg_dV0-6iEw",
  // Web Push (reminders): the PUBLIC half of the VAPID key pair. The private half is only a Supabase function secret.
  VAPID_PUBLIC_KEY: "BDj6BvcDqkXn1g9oWYjObwhVUzmy6lxTglbdroO0MDMGLcoQOixuM95s0pJqDaUapC7fqVoOg6naSmPaTVaIK64"
};
