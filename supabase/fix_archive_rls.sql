-- Fix: archive_entries RLS now uses auth.role() instead of is_owner()
-- Run this in the Supabase SQL Editor

drop policy if exists "owner_all" on archive_entries;

create policy "owner_all"
  on archive_entries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
