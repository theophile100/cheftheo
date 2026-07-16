-- Chef Theo - migration 21 : corrige la contrainte d'unicite de position pour
-- tenir compte du niveau d'etudes et de la langue. Avant cette migration,
-- deux lecons (ou unites) de la meme filiere ne pouvaient jamais partager une
-- position, meme si elles appartenaient a des parcours differents (CAP vs
-- BTS, ou langue differente) -- ce qui empechait de creer du contenu BTS (ou
-- Langues) avec des positions redemarrant a 1. Decouvert en testant la
-- creation d'une lecon BTS : Postgres refusait l'insertion a cause de cette
-- ancienne contrainte, trop stricte.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.lecons drop constraint lecons_filiere_id_position_key;
alter table public.unites drop constraint unites_filiere_id_position_key;

-- coalesce(..., '') : deux valeurs NULL ne sont jamais egales pour une
-- contrainte unique standard, ce qui laisserait passer des doublons pour les
-- filieres metier (niveau_etude/langue_code toujours nuls la ou l'autre axe
-- s'applique) ; le coalesce force une vraie comparaison position par
-- position au sein d'un meme (filiere, niveau, langue).
create unique index lecons_filiere_niveau_langue_position_key
  on public.lecons (filiere_id, coalesce(niveau_etude, ''), coalesce(langue_code, ''), position);

create unique index unites_filiere_niveau_langue_position_key
  on public.unites (filiere_id, coalesce(niveau_etude, ''), coalesce(langue_code, ''), position);
