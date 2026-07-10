-- Chef Theo - migration 10 : likes et commentaires sur les produits Decouvrir.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create table public.produit_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  produit_id uuid not null references public.produits(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, produit_id)
);

alter table public.produit_likes enable row level security;

create policy "produit_likes readable by authenticated" on public.produit_likes
  for select to authenticated using (true);

create or replace function public.toggle_produit_like(p_produit_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted int;
  v_liked boolean;
  v_count int;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  delete from public.produit_likes
  where user_id = v_user_id and produit_id = p_produit_id;

  get diagnostics v_deleted = row_count;

  if v_deleted > 0 then
    v_liked := false;
  else
    insert into public.produit_likes (user_id, produit_id) values (v_user_id, p_produit_id);
    v_liked := true;
  end if;

  select count(*) into v_count from public.produit_likes where produit_id = p_produit_id;

  return jsonb_build_object('liked', v_liked, 'likes_count', v_count);
end;
$$;
grant execute on function public.toggle_produit_like(uuid) to authenticated;

-- Le libelle auteur (ex: partie avant @ de l'email) est calcule et fige au
-- moment du commentaire, pour ne jamais avoir besoin de lire le profil de
-- quelqu'un d'autre (RLS n'autorise chacun a lire que son propre profil).
create table public.produit_commentaires (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references public.produits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_label text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.produit_commentaires enable row level security;

create policy "produit_commentaires readable by authenticated" on public.produit_commentaires
  for select to authenticated using (true);

create or replace function public.add_produit_comment(p_produit_id uuid, p_text text)
returns public.produit_commentaires
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_label text;
  v_text text;
  v_row public.produit_commentaires;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  v_text := trim(p_text);
  if v_text = '' then
    raise exception 'Le commentaire est vide.';
  end if;
  if length(v_text) > 500 then
    raise exception 'Le commentaire est trop long (500 caracteres maximum).';
  end if;

  select email into v_email from public.profiles where id = v_user_id;
  v_label := coalesce(split_part(v_email, '@', 1), 'Utilisateur');

  insert into public.produit_commentaires (produit_id, user_id, author_label, text)
  values (p_produit_id, v_user_id, v_label, v_text)
  returning * into v_row;

  return v_row;
end;
$$;
grant execute on function public.add_produit_comment(uuid, text) to authenticated;
