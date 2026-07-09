-- Chef Théo — migration 5 : logo, icônes de filière, ebooks (likes/commentaires/clics)
-- À coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- Réglages globaux de l'app (une seule ligne), pour le logo notamment.
create table public.app_settings (
  id int primary key default 1,
  logo_url text,
  constraint app_settings_singleton check (id = 1)
);
insert into public.app_settings (id) values (1);

alter table public.app_settings enable row level security;

create policy "app_settings readable by everyone" on public.app_settings
  for select using (true);

-- Icône personnalisée par filière (si vide, l'app utilise une icône par défaut).
alter table public.filieres add column icon_url text;

-- Options et suivi pour les ebooks de l'onglet Découvrir.
alter table public.ebooks add column likes_enabled boolean not null default true;
alter table public.ebooks add column comments_enabled boolean not null default true;
alter table public.ebooks add column clicks integer not null default 0;

-- Compte un clic sur "Obtenir" sans donner aux utilisateurs le droit
-- de modifier un ebook par ailleurs.
create or replace function public.increment_ebook_click(p_ebook_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ebooks set clicks = clicks + 1 where id = p_ebook_id;
end;
$$;

grant execute on function public.increment_ebook_click(uuid) to authenticated;

-- Espace de stockage dédié au logo et aux icônes de filière.
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;
