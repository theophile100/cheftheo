-- Chef Theo - migration 20 : niveau d'etudes (CAP / BTS).
-- Meme principe que la filiere Langues (migration 17) : une colonne
-- niveau_etude sur unites/lecons, nulle pour la filiere Langues qui n'est
-- pas concernee par cet axe. Tout le contenu existant devient "cap" par
-- defaut ; "bts" reste une structure vide tant qu'aucun contenu n'est cree.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.lecons add column niveau_etude text
  check (niveau_etude is null or niveau_etude in ('cap', 'bts'));

alter table public.unites add column niveau_etude text
  check (niveau_etude is null or niveau_etude in ('cap', 'bts'));

update public.lecons set niveau_etude = 'cap'
where niveau_etude is null
  and filiere_id in (select id from public.filieres where slug <> 'langues');

update public.unites set niveau_etude = 'cap'
where niveau_etude is null
  and filiere_id in (select id from public.filieres where slug <> 'langues');

-- Preference de niveau de l'utilisateur, memorisee sur son compte (pas un
-- simple cookie de navigateur) pour qu'elle le suive d'un appareil a l'autre.
alter table public.profiles add column niveau_etude text not null default 'cap'
  check (niveau_etude in ('cap', 'bts'));

grant update (niveau_etude) on public.profiles to authenticated;
