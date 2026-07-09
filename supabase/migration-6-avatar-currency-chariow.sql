-- Chef Théo — migration 6 : photo de profil, lien ou code Chariow pour les ebooks
-- À coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- Photo de profil (téléversée par l'utilisateur lui-même).
alter table public.profiles add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Chariow : soit un simple lien, soit un code d'intégration ("Snap").
alter table public.ebooks add column cta_type text not null default 'url' check (cta_type in ('url', 'embed'));
alter table public.ebooks add column chariow_embed_code text;
alter table public.ebooks alter column chariow_url drop not null;
