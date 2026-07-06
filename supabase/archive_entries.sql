-- ─────────────────────────────────────────────────────────────
--  Morpheus — Archive Entries table
--  Run this in the Supabase SQL Editor after migration.sql
-- ─────────────────────────────────────────────────────────────

create table if not exists archive_entries (
  id            bigint generated always as identity primary key,
  title         text        not null,
  date          text,
  image_url     text,
  category      text        check (category in ('music', 'film', 'book', 'art', 'other')),
  position      integer     not null default 0,
  link          text,
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table archive_entries enable row level security;

drop policy if exists "public_read" on archive_entries;
create policy "public_read"
  on archive_entries for select
  using (true);

drop policy if exists "owner_all" on archive_entries;
create policy "owner_all"
  on archive_entries for all
  using (is_owner());
