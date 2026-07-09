-- Chef Théo — migration 4 : unités (regroupement de leçons par thème)
-- À coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create table public.unites (
  id uuid primary key default gen_random_uuid(),
  filiere_id uuid not null references public.filieres(id) on delete cascade,
  title text not null,
  position integer not null,
  unique (filiere_id, position)
);

alter table public.unites enable row level security;

create policy "unites readable by authenticated" on public.unites
  for select to authenticated using (true);

alter table public.lecons
  add column unite_id uuid references public.unites(id) on delete cascade;
