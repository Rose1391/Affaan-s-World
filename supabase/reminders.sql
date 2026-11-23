-- =====================================================================
-- Affaan's World — reminders (Web Push). Run after schema.sql. Safe to re-run.
-- Each device stores its push subscription and its own upcoming reminder list;
-- the send-reminders Edge Function (every 5 min via pg_cron) pushes what is due.
-- =====================================================================
create table if not exists public.push_devices (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  family_id  uuid references public.families(id) on delete cascade,
  sub        jsonb not null,
  schedule   jsonb not null default '[]'::jsonb,
  sent       jsonb not null default '{}'::jsonb,
  tz         text,
  updated_at timestamptz not null default now()
);
alter table public.push_devices enable row level security;
-- no direct table access for app users: only the two functions below (and the server job) touch it
revoke all on public.push_devices from anon, authenticated;

create or replace function public.save_push_device(p_endpoint text, p_sub jsonb, p_schedule jsonb, p_tz text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then raise exception 'bad endpoint'; end if;
  if jsonb_typeof(p_schedule) <> 'array' or jsonb_array_length(p_schedule) > 400 or length(p_schedule::text) > 200000 then raise exception 'schedule too large'; end if;
  select m.family_id into fid from public.family_members m where m.user_id = auth.uid() limit 1;
  insert into public.push_devices(endpoint, user_id, family_id, sub, schedule, tz, updated_at)
  values (p_endpoint, auth.uid(), fid, p_sub, p_schedule, p_tz, now())
  on conflict (endpoint) do update set user_id = excluded.user_id, family_id = excluded.family_id, sub = excluded.sub,
    schedule = excluded.schedule, tz = excluded.tz, updated_at = now();
end $$;
create or replace function public.remove_push_device(p_endpoint text)
returns void language sql security definer set search_path = '' as $$
  delete from public.push_devices where endpoint = p_endpoint and user_id = auth.uid();
$$;
revoke all on function public.save_push_device(text, jsonb, jsonb, text) from public, anon;
revoke all on function public.remove_push_device(text) from public, anon;
grant execute on function public.save_push_device(text, jsonb, jsonb, text) to authenticated;
grant execute on function public.remove_push_device(text) to authenticated;

-- every 5 minutes: call the Edge Function (the key lives in Vault as 'reminder_cron_key')
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('affaan-send-reminders') where exists (select 1 from cron.job where jobname = 'affaan-send-reminders');
select cron.schedule('affaan-send-reminders', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://yteazojpoyxrvvvwvxky.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object('content-type', 'application/json',
      'x-cron-key', (select decrypted_secret from vault.decrypted_secrets where name = 'reminder_cron_key')),
    body := '{}'::jsonb, timeout_milliseconds := 20000);
$job$);
