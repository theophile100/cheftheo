-- Chef Théo — migration 3 : édition du profil (pays/téléphone) + table ebooks
-- À coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- Permet à un utilisateur connecté de modifier UNIQUEMENT ses colonnes
-- pays/téléphone, sur sa propre ligne (jamais son XP, sa série, etc.).
grant update (country, phone) on public.profiles to authenticated;

create policy "users update own basic info" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Table des ebooks affichés dans l'onglet "Découvrir".
create table public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10, 2) not null default 0,
  cover_url text,
  chariow_url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ebooks enable row level security;

create policy "ebooks readable by authenticated" on public.ebooks
  for select to authenticated using (true);

-- Pas de policy d'écriture : pour l'instant, ajoutez vos ebooks directement
-- dans Supabase (Table Editor > ebooks > Insert row).
