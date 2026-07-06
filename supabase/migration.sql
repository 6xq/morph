-- ─────────────────────────────────────────────────────────────
--  Morpheus — "Send Something" Recommendation Inbox
--  Final migration — run this ONCE in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Create the recommendations table (safe to re-run)
create table if not exists recommendations (
  id                bigint generated always as identity primary key,
  type              text        not null check (type in ('song', 'album', 'film', 'book', 'show', 'other')),
  title             text        not null check (char_length(title) between 1 and 200),
  artist_director   text        check (char_length(artist_director) <= 200),
  link              text        check (char_length(link) <= 2000),
  message           text        check (char_length(message) <= 1000),
  sender_name       text        check (char_length(sender_name) <= 200),
  status            text        not null default 'unread' check (status in ('unread', 'read', 'queued', 'dismissed')),
  submitter_ip_hash text        check (char_length(submitter_ip_hash) <= 64),
  created_at        timestamptz not null default now(),
  website_url_confirm text,
  form_rendered_at    text
);

-- 2. Enable Row Level Security
alter table recommendations enable row level security;

-- 3. Drop existing policies so this script is safe to re-run
drop policy if exists "public_insert" on recommendations;
drop policy if exists "owner_select" on recommendations;
drop policy if exists "owner_update" on recommendations;
drop policy if exists "owner_delete" on recommendations;

-- 4. Owner check — email of the single allowed admin user
create or replace function is_owner()
returns boolean
language sql
stable
as $$
  select auth.jwt() ->> 'email' = 'mohamedp771@gmail.com';
$$;

-- 5. RLS policies
create policy "public_insert"
  on recommendations for insert
  with check (true);

create policy "owner_select"
  on recommendations for select
  using (is_owner());

create policy "owner_update"
  on recommendations for update
  using (is_owner());

create policy "owner_delete"
  on recommendations for delete
  using (is_owner());

-- 6. Helper: strip HTML tags
create or replace function strip_html(val text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(val, ''), '<[^>]*>', '', 'g');
$$;

-- 7. Trigger function: validate + sanitize on every insert
create or replace function handle_recommendation_insert()
returns trigger
language plpgsql
as $$
declare
  valid_types text[] := array['song', 'album', 'film', 'book', 'show', 'other'];
begin
  if coalesce(new.website_url_confirm, '') != '' then
    return null;
  end if;

  if new.form_rendered_at is null or new.form_rendered_at !~ '^\d+$' then
    return null;
  end if;

  if extract(epoch from now()) < (new.form_rendered_at::bigint / 1000) + 2 then
    return null;
  end if;

  if not (new.type = any(valid_types)) then
    raise exception 'Invalid type.';
  end if;

  if new.title is null or char_length(trim(new.title)) = 0 then
    raise exception 'Title is required.';
  end if;

  if new.link is not null and new.link != '' then
    if new.link !~ '^https?://[^\s]+$' then
      raise exception 'Link must start with http:// or https://';
    end if;
  end if;

  new.title := strip_html(new.title);
  new.artist_director := strip_html(new.artist_director);
  new.message := strip_html(new.message);
  new.sender_name := strip_html(new.sender_name);

  new.title := left(new.title, 200);
  new.artist_director := left(new.artist_director, 200);
  new.message := left(new.message, 1000);
  new.sender_name := left(new.sender_name, 200);
  new.link := left(new.link, 2000);

  new.status := 'unread';
  new.website_url_confirm := null;
  new.form_rendered_at := null;

  if new.link is not null and new.link != '' then
    if exists (
      select 1 from recommendations
      where title = new.title
        and link = new.link
        and created_at > now() - interval '24 hours'
    ) then
      return null;
    end if;
  end if;

  return new;
end;
$$;

-- 8. Attach trigger
drop trigger if exists trg_recommendation_insert on recommendations;
create trigger trg_recommendation_insert
  before insert on recommendations
  for each row
  execute function handle_recommendation_insert();

-- ─────────────────────────────────────────────────────────────
--  Archive Entries — for the Edit Archive admin page
-- ─────────────────────────────────────────────────────────────

-- 9. Create the archive_entries table
create table if not exists archive_entries (
  id          bigint generated always as identity primary key,
  title       text        not null check (char_length(title) between 1 and 500),
  date        text        check (char_length(date) <= 100),
  image_url   text        check (char_length(image_url) <= 2000),
  category    text        check (category in ('music', 'film', 'book', 'art', 'other')),
  link        text        check (char_length(link) <= 2000),
  description text        check (char_length(description) <= 2000),
  position    integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 10. Enable RLS
alter table archive_entries enable row level security;

-- 11. Drop existing policies so this script is safe to re-run
drop policy if exists "public_select" on archive_entries;
drop policy if exists "owner_all" on archive_entries;

-- 12. RLS policies
create policy "public_select"
  on archive_entries for select
  using (true);

create policy "owner_all"
  on archive_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────
--  Storage bucket for archive cover images
-- ─────────────────────────────────────────────────────────────

-- 13. Create bucket (safe to re-run)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'archive-images',
  'archive-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 14. Drop existing storage policies so this script is safe to re-run
drop policy if exists "Public read" on storage.objects;
drop policy if exists "Owner upload" on storage.objects;
drop policy if exists "Owner update" on storage.objects;
drop policy if exists "Owner delete" on storage.objects;

-- 15. Storage RLS policies
create policy "Public read"
  on storage.objects for select
  using (bucket_id = 'archive-images');

create policy "Owner upload"
  on storage.objects for insert
  with check (bucket_id = 'archive-images' and auth.role() = 'authenticated');

create policy "Owner update"
  on storage.objects for update
  using (bucket_id = 'archive-images' and auth.role() = 'authenticated');

create policy "Owner delete"
  on storage.objects for delete
  using (bucket_id = 'archive-images' and auth.role() = 'authenticated');
