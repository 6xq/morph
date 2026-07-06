-- Fix RLS policies for recommendations table
-- Run this in the Supabase SQL Editor after the main migration

-- Drop existing policies (so we can recreate cleanly)
drop policy if exists "public_insert" on recommendations;
drop policy if exists "owner_select" on recommendations;
drop policy if exists "owner_update" on recommendations;
drop policy if exists "owner_delete" on recommendations;

-- Recreate policies
create policy "public_insert"
  on recommendations for insert
  with check (true);

create policy "owner_select"
  on recommendations for select
  using (auth.uid() = 'YOUR_AUTH0_USER_ID');

create policy "owner_update"
  on recommendations for update
  using (auth.uid() = 'YOUR_AUTH0_USER_ID');

create policy "owner_delete"
  on recommendations for delete
  using (auth.uid() = 'YOUR_AUTH0_USER_ID');

-- Verify the table has the transient columns (add if missing)
alter table recommendations add column if not exists website_url_confirm text;
alter table recommendations add column if not exists form_rendered_at text;

-- Recreate the trigger function and trigger (from the updated migration)
create or replace function strip_html(val text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(val, ''), '<[^>]*>', '', 'g');
$$;

create or replace function handle_recommendation_insert()
returns trigger
language plpgsql
as $$
declare
  valid_types text[] := array['song', 'album', 'film', 'book', 'show', 'other'];
  _honey text;
  _clock text;
begin
  begin
    _honey := new.website_url_confirm;
  exception when others then
    _honey := '';
  end;

  begin
    _clock := new.form_rendered_at;
  exception when others then
    _clock := '';
  end;

  if coalesce(_honey, '') != '' then
    return null;
  end if;

  if _clock is not null and _clock ~ '^\d+$' then
    if extract(epoch from now()) < (_clock::bigint / 1000) + 0.5 then
      return null;
    end if;
  end if;

  if not (new.type = any(valid_types)) then
    raise exception 'Invalid type. Must be one of: song, album, film, book, show, other.';
  end if;

  if new.title is null or char_length(trim(new.title)) = 0 then
    raise exception 'Title is required.';
  end if;
  if char_length(new.title) > 200 then
    raise exception 'Title must be 200 characters or fewer.';
  end if;

  if new.link is not null and new.link != '' then
    if not (new.link ~ '^https?://[^\s]+$') then
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

drop trigger if exists trg_recommendation_insert on recommendations;
create trigger trg_recommendation_insert
  before insert on recommendations
  for each row
  execute function handle_recommendation_insert();
