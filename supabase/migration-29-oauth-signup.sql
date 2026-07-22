-- Chef Theo - migration 29 : connexion Google/Apple (OAuth).
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".
--
-- display_name est obligatoire (not null) sur profiles. Une inscription par
-- email/mot de passe le fournit toujours explicitement, mais une connexion
-- Google/Apple ne renvoie jamais la cle "display_name" (c'est notre propre
-- nom de champ) -- sans repli, l'insertion du profil echouerait pour tout
-- nouveau compte cree via Google/Apple. On reprend donc le nom fourni par
-- le fournisseur (full_name pour Google, name pour Apple si autorise),
-- et a defaut la partie avant @ de l'email.
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
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    lower(new.email) = lower('theophileeklu100@gmail.com')
  );
  return new;
end;
$$;
