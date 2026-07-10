-- Chef Theo - migration 12 : pseudo (display_name) obligatoire, seul identifiant
-- public. L'email ne doit plus jamais apparaitre en dehors des reglages du
-- compte et de l'espace admin.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.profiles add column display_name text;

-- Comptes deja crees avant ce champ : pseudo de depart derive de l'email,
-- modifiable ensuite depuis le profil.
update public.profiles set display_name = split_part(email, '@', 1) where display_name is null;

alter table public.profiles alter column display_name set not null;

-- Permet a un utilisateur connecte de modifier son propre pseudo (la policy
-- "users update own basic info" de la migration 3 couvre deja la ligne).
grant update (display_name) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, country, phone, display_name, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'display_name',
    lower(new.email) = lower('theophileeklu100@gmail.com')
  );
  return new;
end;
$$;

-- Les commentaires affichaient jusqu'ici le prefixe de l'email de l'auteur ;
-- ils affichent maintenant son pseudo.
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

  select display_name into v_label from public.profiles where id = v_user_id;
  v_label := coalesce(v_label, 'Utilisateur');

  insert into public.produit_commentaires
    (produit_id, user_id, author_label, text, parent_comment_id, status)
  values
    (p_produit_id, v_user_id, v_label, v_text, p_parent_comment_id, 'en_attente')
  returning * into v_row;

  return v_row;
end;
$$;
