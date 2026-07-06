-- Seed: insert fallback archive entries & update archive_entries RLS

-- 1. Fix archive_entries RLS to use auth.role() instead of is_owner()
drop policy if exists "owner_all" on archive_entries;
create policy "owner_all"
  on archive_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Insert the 8 fallback entries (idempotent — skips if title already exists)
insert into archive_entries (title, date, image_url, category, position, link, description)
select * from (values
  ('WENDYKURK / SOFT MEAT',    '10 June, 2026',   '', 'music', 0,  '', ''),
  ('FELVIDEK',                 '8 June, 2026',    '', 'music', 1,  '', ''),
  ('MAUVAIS SANG 1986 / LEOS CARAX', '9 June, 2026', '', 'film',  2,  '', ''),
  ('WHITE NIGHTS // FYODOR DOSTOEVSKY', '8 June, 2026', '', 'book',  3,  '', ''),
  ('MOOSE / COOL BREEZE',      '1 April, 2025',   '', 'music', 4,  '', ''),
  ('G-SCHMITT / GARNET',       '1 April, 2025',   '', 'music', 5,  '', ''),
  ('MBV / YOU MADE ME REALISE','30 December, 2021','', 'music', 6,  '', ''),
  ('THE MYRIAD FORM / THE MYRIAD FORM','30 January, 2026','','music',7,'','')
) as v(title, date, image_url, category, position, link, description)
where not exists (select 1 from archive_entries where archive_entries.title = v.title);
