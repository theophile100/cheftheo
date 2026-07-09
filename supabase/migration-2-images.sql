-- Chef Théo — migration 2 : images sur les questions
-- À coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.questions add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('lesson-images', 'lesson-images', true)
on conflict (id) do nothing;
