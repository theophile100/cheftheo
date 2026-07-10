-- Chef Theo - migration 11 : moderation des commentaires (statut en_attente/
-- approuve/refuse), reponses (parent_comment_id), et likes par commentaire.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.produit_commentaires
  add column status text not null default 'en_attente'
    check (status in ('en_attente', 'approuve', 'refuse'));

alter table public.produit_commentaires
  add column parent_comment_id uuid references public.produit_commentaires(id) on delete cascade;

-- Un commentaire n'est visible par les autres que s'il est approuve ; son
-- auteur voit toujours le sien, quel que soit son statut.
drop policy "produit_commentaires readable by authenticated" on public.produit_commentaires;

create policy "produit_commentaires readable by authenticated" on public.produit_commentaires
  for select to authenticated
  using (status = 'approuve' or user_id = auth.uid());

create or replace function public.add_produit_comment(
  p_produit_id uuid,
  p_text text,
  p_parent_comment_id uuid default null
)
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

  insert into public.produit_commentaires
    (produit_id, user_id, author_label, text, parent_comment_id, status)
  values
    (p_produit_id, v_user_id, v_label, v_text, p_parent_comment_id, 'en_attente')
  returning * into v_row;

  return v_row;
end;
$$;
grant execute on function public.add_produit_comment(uuid, text, uuid) to authenticated;

-- Likes sur un commentaire (independants des likes sur le produit lui-meme).
create table public.commentaire_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  commentaire_id uuid not null references public.produit_commentaires(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, commentaire_id)
);

alter table public.commentaire_likes enable row level security;

create policy "commentaire_likes readable by authenticated" on public.commentaire_likes
  for select to authenticated using (true);

create or replace function public.toggle_commentaire_like(p_commentaire_id uuid)
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

  delete from public.commentaire_likes
  where user_id = v_user_id and commentaire_id = p_commentaire_id;

  get diagnostics v_deleted = row_count;

  if v_deleted > 0 then
    v_liked := false;
  else
    insert into public.commentaire_likes (user_id, commentaire_id) values (v_user_id, p_commentaire_id);
    v_liked := true;
  end if;

  select count(*) into v_count from public.commentaire_likes where commentaire_id = p_commentaire_id;

  return jsonb_build_object('liked', v_liked, 'likes_count', v_count);
end;
$$;
grant execute on function public.toggle_commentaire_like(uuid) to authenticated;
