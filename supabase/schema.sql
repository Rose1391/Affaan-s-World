-- =====================================================================
-- Affaan's World v5 — Supabase schema
-- Run once in Supabase → SQL Editor (safe to re-run).
-- Model: one "family" with at most 2 parents. Every record row and every
-- photo belongs to the family; Row Level Security only lets members in.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists public.families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Affaan''s World',
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id  uuid not null references public.families(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner','parent')),
  email      text,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
create index if not exists family_members_user_idx on public.family_members(user_id);

create table if not exists public.family_invites (
  family_id  uuid not null references public.families(id) on delete cascade,
  email      text not null,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (family_id, email)
);

-- Every app record (milestone, growth, vaccine, visit, photo metadata …) is one row.
-- updated_at  = the client's edit time  → used for "last edit wins".
-- server_updated_at = when the server stored it → used as the pull cursor.
create table if not exists public.records (
  family_id         uuid not null references public.families(id) on delete cascade,
  id                text not null,
  kind              text not null,
  data              jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null,
  deleted           boolean not null default false,
  updated_by        uuid default auth.uid() references auth.users(id) on delete set null,
  server_updated_at timestamptz not null default clock_timestamp(),
  primary key (family_id, id)
);
create index if not exists records_pull_idx on public.records(family_id, server_updated_at);
create index if not exists records_kind_idx on public.records(family_id, kind);

create or replace function public.touch_server_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.data is not distinct from old.data and new.updated_at = old.updated_at
     and new.deleted = old.deleted and new.kind = old.kind then
    return new;   -- e.g. updated_by nulled by a user deletion: not a content change
  end if;
  new.server_updated_at := clock_timestamp();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before insert or update on public.records
  for each row execute function public.touch_server_updated_at();

-- ---------- membership helper ----------
create or replace function public.is_member(fid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_members m
    where m.family_id = fid and m.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_member(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;

-- ---------- RLS ----------
alter table public.families       enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invites enable row level security;
alter table public.records        enable row level security;

drop policy if exists families_read on public.families;
create policy families_read on public.families for select to authenticated
  using (public.is_member(id));

drop policy if exists members_read on public.family_members;
create policy members_read on public.family_members for select to authenticated
  using (public.is_member(family_id));

drop policy if exists invites_read on public.family_invites;
create policy invites_read on public.family_invites for select to authenticated
  using (public.is_member(family_id));

drop policy if exists records_select on public.records;
drop policy if exists records_insert on public.records;
drop policy if exists records_update on public.records;
drop policy if exists records_delete on public.records;
create policy records_select on public.records for select to authenticated
  using (public.is_member(family_id));
create policy records_insert on public.records for insert to authenticated
  with check (public.is_member(family_id));
create policy records_update on public.records for update to authenticated
  using (public.is_member(family_id)) with check (public.is_member(family_id));
create policy records_delete on public.records for delete to authenticated
  using (public.is_member(family_id));

revoke all on public.families, public.family_members, public.family_invites, public.records from anon;
grant select on public.families, public.family_members, public.family_invites to authenticated;
grant select, insert, update, delete on public.records to authenticated;

-- ---------- RPC: join or create the family ----------
-- 1) already a member → return that family
-- 2) invited by e-mail → join as second parent
-- 3) otherwise → create a new family and become its owner
create or replace function public.ensure_family() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid   uuid := auth.uid();
  mail  text := lower(coalesce(auth.jwt() ->> 'email', ''));
  fid   uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;

  select family_id into fid from public.family_members where user_id = uid limit 1;
  if fid is not null then return fid; end if;

  select family_id into fid from public.family_invites where lower(email) = mail limit 1;
  if fid is not null then
    if (select count(*) from public.family_members where family_id = fid) >= 2 then
      raise exception 'family already has two parents';
    end if;
    insert into public.family_members(family_id, user_id, role, email) values (fid, uid, 'parent', mail);
    delete from public.family_invites where family_id = fid and lower(email) = mail;
    return fid;
  end if;

  insert into public.families(created_by) values (uid) returning id into fid;
  insert into public.family_members(family_id, user_id, role, email) values (fid, uid, 'owner', mail);
  return fid;
end $$;

-- ---------- RPC: owner invites the second parent ----------
create or replace function public.invite_parent(invite_email text) returns void
language plpgsql security definer set search_path = '' as $$
declare fid uuid;
begin
  select family_id into fid from public.family_members
   where user_id = auth.uid() and role = 'owner' limit 1;
  if fid is null then raise exception 'only the owner can invite'; end if;
  if (select count(*) from public.family_members where family_id = fid)
     + (select count(*) from public.family_invites where family_id = fid) >= 2 then
    raise exception 'a second parent is already invited or joined';
  end if;
  insert into public.family_invites(family_id, email, invited_by)
  values (fid, lower(trim(invite_email)), auth.uid())
  on conflict do nothing;
end $$;

create or replace function public.cancel_invite() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.family_invites i using public.family_members m
   where m.family_id = i.family_id and m.user_id = auth.uid() and m.role = 'owner';
end $$;

-- ---------- RPC: batched "last edit wins" upsert ----------
create or replace function public.upsert_records(fid uuid, rows jsonb) returns integer
language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  if not public.is_member(fid) then raise exception 'not a member'; end if;
  with incoming as (
    select r->>'id' as id, r->>'kind' as kind, coalesce(r->'data','{}'::jsonb) as data,
           (r->>'updated_at')::timestamptz as updated_at, coalesce((r->>'deleted')::boolean,false) as deleted
    from jsonb_array_elements(rows) r
  ), up as (
    insert into public.records as t (family_id, id, kind, data, updated_at, deleted)
    select fid, id, kind, data, updated_at, deleted from incoming
    on conflict (family_id, id) do update
      set kind = excluded.kind, data = excluded.data,
          updated_at = excluded.updated_at, deleted = excluded.deleted
      where t.updated_at < excluded.updated_at      -- last edit wins
    returning 1
  ) select count(*) into n from up;
  return n;
end $$;

-- ---------- storage: private bucket for compressed photos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

-- object names are "<family_id>/<photo_id>.jpg"
create or replace function public.storage_family(name text) returns uuid
language plpgsql immutable set search_path = '' as $$
begin
  return split_part(name, '/', 1)::uuid;
exception when others then return null;
end $$;

drop policy if exists photos_select on storage.objects;
drop policy if exists photos_insert on storage.objects;
drop policy if exists photos_update on storage.objects;
drop policy if exists photos_delete on storage.objects;
create policy photos_select on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.is_member(public.storage_family(name)));
create policy photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_member(public.storage_family(name)));
create policy photos_update on storage.objects for update to authenticated
  using (bucket_id = 'photos' and public.is_member(public.storage_family(name)))
  with check (bucket_id = 'photos' and public.is_member(public.storage_family(name)));
create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_member(public.storage_family(name)));

-- bytes used by this family's photos (shown in Settings vs the 1 GB free tier)
create or replace function public.storage_used(fid uuid) returns bigint
language sql stable security definer set search_path = '' as $$
  select case when public.is_member(fid) then
    coalesce(sum((o.metadata->>'size')::bigint), 0) else 0 end
  from storage.objects o
  where o.bucket_id = 'photos' and split_part(o.name, '/', 1) = fid::text;
$$;

revoke all on function public.ensure_family(), public.invite_parent(text), public.cancel_invite(),
  public.upsert_records(uuid, jsonb), public.storage_used(uuid) from public, anon;
grant execute on function public.ensure_family(), public.invite_parent(text), public.cancel_invite(),
  public.upsert_records(uuid, jsonb), public.storage_used(uuid) to authenticated;

-- ---------- Realtime: push changes to the other parent's phone instantly (RLS still applies) ----------
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'records') then
    alter publication supabase_realtime add table public.records;
  end if;
end $$;
