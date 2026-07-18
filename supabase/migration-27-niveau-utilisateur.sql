-- Chef Theo - migration 27 : niveaux d'utilisateur (debutant / intermediaire / avance).
-- Axe independant du niveau d'etudes CAP/BTS (migration 20, qui suit le
-- diplome vise) : celui-ci reflete l'experience personnelle de la personne
-- et sert a adapter le contenu propose + a offrir un test de placement.
-- Nulle par defaut, y compris pour les comptes deja existants, afin de
-- declencher l'ecran de bienvenue une seule fois, au prochain passage sur
-- /accueil -- une fois choisi, le champ n'est plus jamais remis a null.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.profiles add column niveau_utilisateur text
  check (niveau_utilisateur is null or niveau_utilisateur in ('debutant', 'intermediaire', 'avance'));

grant update (niveau_utilisateur) on public.profiles to authenticated;

-- L'administrateur n'a pas besoin de choisir : ca lui evite l'ecran de
-- bienvenue a chaque fois qu'il gere le contenu.
update public.profiles set niveau_utilisateur = 'avance' where is_admin = true;

-- Meme principe que niveau_etude (migration 20) mais nullable : une lecon ou
-- une unite non marquee reste visible pour tous les niveaux. Aucun contenu
-- existant n'est marque pour l'instant -- tout reste visible partout tant
-- qu'aucune lecon n'est explicitement reservee a un niveau depuis l'admin.
alter table public.lecons add column niveau_difficulte text
  check (niveau_difficulte is null or niveau_difficulte in ('debutant', 'intermediaire', 'avance'));

alter table public.unites add column niveau_difficulte text
  check (niveau_difficulte is null or niveau_difficulte in ('debutant', 'intermediaire', 'avance'));
