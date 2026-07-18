-- Chef Theo - migration 28 : Niveau 1 / Niveau 2 par filiere.
-- Nouvel axe "parcours_niveau" (1 ou 2) sur lecons/unites, independant du
-- niveau d'etudes CAP/BTS (migration 20) et du niveau utilisateur
-- debutant/intermediaire/avance (migration 27). Niveau 1 = le parcours
-- actuel (couvre 1ere et 2eme annee) ; Niveau 2 = reserve pour plus tard,
-- vide pour l'instant -- meme principe que BTS a son lancement.
-- Tout le contenu existant devient Niveau 1 par defaut.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.lecons add column parcours_niveau smallint not null default 1
  check (parcours_niveau in (1, 2));

alter table public.unites add column parcours_niveau smallint not null default 1
  check (parcours_niveau in (1, 2));

-- La contrainte d'unicite de position (migration 21) doit desormais aussi
-- tenir compte du parcours_niveau, sinon le Niveau 2 d'une filiere ne
-- pourrait jamais redemarrer sa numerotation a 1.
drop index public.lecons_filiere_niveau_langue_position_key;
drop index public.unites_filiere_niveau_langue_position_key;

create unique index lecons_filiere_niveau_langue_position_key
  on public.lecons (filiere_id, coalesce(niveau_etude, ''), coalesce(langue_code, ''), parcours_niveau, position);

create unique index unites_filiere_niveau_langue_position_key
  on public.unites (filiere_id, coalesce(niveau_etude, ''), coalesce(langue_code, ''), parcours_niveau, position);
