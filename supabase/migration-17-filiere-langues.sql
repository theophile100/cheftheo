-- Chef Theo - migration 17 : nouvelle filiere "Langues", avec un parcours
-- independant par langue (francais, anglais, allemand, espagnol, arabe).
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

insert into public.filieres (slug, name, position)
values ('langues', 'Langues', 6)
on conflict (slug) do nothing;

-- Langue du contenu (null = filieres metier classiques, non concernees).
-- Une leçon/niveau "Langues" appartient a exactement une des 5 langues, ce
-- qui separe naturellement la progression (chaque langue a ses propres
-- lignes, donc user_lecons suit chaque parcours independamment sans rien
-- changer au schema de progression existant).
alter table public.lecons add column langue_code text
  check (langue_code is null or langue_code in ('fr', 'en', 'de', 'es', 'ar'));

alter table public.unites add column langue_code text
  check (langue_code is null or langue_code in ('fr', 'en', 'de', 'es', 'ar'));
