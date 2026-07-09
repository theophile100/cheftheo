-- Chef Théo — migration initiale
-- À coller intégralement dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  country text,
  phone text,
  xp_total integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.filieres (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  position integer not null default 0
);

create table public.lecons (
  id uuid primary key default gen_random_uuid(),
  filiere_id uuid not null references public.filieres(id) on delete cascade,
  title text not null,
  position integer not null,
  unique (filiere_id, position)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  lecon_id uuid not null references public.lecons(id) on delete cascade,
  type text not null check (type in ('qcm', 'associer', 'ordonner')),
  position integer not null,
  prompt text not null,
  explanation text,
  data jsonb not null,
  unique (lecon_id, position)
);

create table public.user_lecons (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lecon_id uuid not null references public.lecons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  xp_earned integer not null default 0,
  primary key (user_id, lecon_id)
);

create index idx_lecons_filiere_position on public.lecons (filiere_id, position);
create index idx_questions_lecon_position on public.questions (lecon_id, position);
create index idx_user_lecons_user on public.user_lecons (user_id);

-- ============================================================
-- SIGNUP TRIGGER — creates a profile row for every new auth.users row
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, country, phone, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'phone',
    lower(new.email) = lower('theophileeklu100@gmail.com')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- complete_lecon — the ONLY way XP/streak/completion get written.
-- Computes XP server-side, applies the streak algorithm, idempotent.
-- ============================================================

create or replace function public.complete_lecon(p_lecon_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question_count int;
  v_xp_earned int;
  v_today date := current_date;
  v_new_streak int;
  v_profile public.profiles;
  v_inserted int;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select count(*) into v_question_count from public.questions where lecon_id = p_lecon_id;
  v_xp_earned := v_question_count * 10;

  insert into public.user_lecons (user_id, lecon_id, xp_earned)
  values (v_user_id, p_lecon_id, v_xp_earned)
  on conflict (user_id, lecon_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    select * into v_profile from public.profiles where id = v_user_id;
    return v_profile;
  end if;

  select case
    when last_activity_date = v_today then current_streak
    when last_activity_date = v_today - 1 then current_streak + 1
    else 1
  end into v_new_streak
  from public.profiles where id = v_user_id;

  update public.profiles
  set xp_total = xp_total + v_xp_earned,
      current_streak = v_new_streak,
      longest_streak = greatest(longest_streak, v_new_streak),
      last_activity_date = v_today
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;

grant execute on function public.complete_lecon(uuid) to authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.filieres enable row level security;
alter table public.lecons enable row level security;
alter table public.questions enable row level security;
alter table public.user_lecons enable row level security;

create policy "users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "filieres readable by authenticated" on public.filieres
  for select to authenticated using (true);

create policy "lecons readable by authenticated" on public.lecons
  for select to authenticated using (true);

create policy "questions readable by authenticated" on public.questions
  for select to authenticated using (true);

create policy "users read own completions" on public.user_lecons
  for select to authenticated using (auth.uid() = user_id);

-- No insert/update/delete policies anywhere: all writes go through
-- complete_lecon() (SECURITY DEFINER) or the service_role key (admin panel).

-- ============================================================
-- SEED CONTENT — 5 filières x 5 leçons.
-- Service > Leçon 1 has the full requested content (5 questions, 3 types).
-- All other leçons get one real, themed QCM question each — a working
-- starting point, meant to be expanded from /admin.
-- ============================================================

insert into public.filieres (slug, name, icon, position) values
  ('cuisine', 'Cuisine', '🍳', 1),
  ('patisserie', 'Pâtisserie', '🍰', 2),
  ('bar-et-vins', 'Bar et Vins', '🍷', 3),
  ('service', 'Service', '🍽️', 4),
  ('hotellerie', 'Hôtellerie', '🏨', 5);

insert into public.lecons (filiere_id, title, position)
select f.id, 'Leçon ' || n, n
from public.filieres f
cross join generate_series(1, 5) as n;

-- ---------- CUISINE ----------
insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie l''abréviation « HACCP » utilisée en cuisine ?',
  'HACCP est une méthode de maîtrise de la sécurité sanitaire des aliments, utilisée dans toutes les cuisines professionnelles.',
  '{"options":[{"id":"a","text":"Hazard Analysis Critical Control Point"},{"id":"b","text":"Hôtel-Café-Cuisine-Pâtisserie"},{"id":"c","text":"Une norme de décoration"},{"id":"d","text":"Un type de cuisson"}],"correct_option_id":"a"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'cuisine' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Quelle est la température de conservation recommandée pour un réfrigérateur professionnel ?',
  'Un réfrigérateur professionnel doit être maintenu entre 0°C et 4°C pour limiter le développement bactérien.',
  '{"options":[{"id":"a","text":"Entre 0°C et 4°C"},{"id":"b","text":"Entre 10°C et 15°C"},{"id":"c","text":"Entre -5°C et 0°C"},{"id":"d","text":"Peu importe"}],"correct_option_id":"a"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'cuisine' and l.position = 2;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « blanchir » un légume ?',
  'Blanchir consiste à cuire très brièvement dans l''eau bouillante puis à stopper la cuisson dans l''eau glacée, pour préserver couleur et texture.',
  '{"options":[{"id":"a","text":"Le colorer en blanc avec un colorant"},{"id":"b","text":"Le plonger brièvement dans l''eau bouillante puis dans l''eau glacée"},{"id":"c","text":"Le faire frire"},{"id":"d","text":"Le laisser mariner"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'cuisine' and l.position = 3;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Quel ustensile utilise-t-on pour lever un filet de poisson ?',
  'Le couteau filet de sole, fin et flexible, est spécialement conçu pour lever proprement les filets de poisson.',
  '{"options":[{"id":"a","text":"Un fouet"},{"id":"b","text":"Une écumoire"},{"id":"c","text":"Un couteau filet de sole"},{"id":"d","text":"Une spatule"}],"correct_option_id":"c"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'cuisine' and l.position = 4;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie le terme « déglacer » ?',
  'Déglacer consiste à verser un liquide (vin, fond, eau) dans une poêle chaude pour décoller les sucs de cuisson et en faire une base de sauce.',
  '{"options":[{"id":"a","text":"Retirer le glaçage d''un gâteau"},{"id":"b","text":"Récupérer les sucs de cuisson avec un liquide"},{"id":"c","text":"Refroidir rapidement un plat"},{"id":"d","text":"Ajouter de la glace dans une sauce"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'cuisine' and l.position = 5;

-- ---------- PÂTISSERIE ----------
insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « crémer » du beurre et du sucre ?',
  'Crémer consiste à battre le beurre et le sucre pour incorporer de l''air et obtenir une texture légère, base de nombreuses pâtisseries.',
  '{"options":[{"id":"a","text":"Les faire fondre ensemble"},{"id":"b","text":"Les battre ensemble jusqu''à obtenir un mélange léger et aéré"},{"id":"c","text":"Les mélanger à froid rapidement"},{"id":"d","text":"Ajouter de la crème fraîche"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'patisserie' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'À quelle température cuit-on généralement une pâte à choux ?',
  'La pâte à choux cuit habituellement entre 180°C et 200°C, ce qui permet un bon développement et un séchage correct.',
  '{"options":[{"id":"a","text":"Environ 180-200°C"},{"id":"b","text":"Environ 100°C"},{"id":"c","text":"Environ 250°C"},{"id":"d","text":"À froid, sans cuisson"}],"correct_option_id":"a"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'patisserie' and l.position = 2;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « abaisser » une pâte ?',
  'Abaisser une pâte signifie l''étaler au rouleau jusqu''à obtenir l''épaisseur souhaitée.',
  '{"options":[{"id":"a","text":"La laisser reposer au frais"},{"id":"b","text":"L''étaler à l''aide d''un rouleau à une épaisseur donnée"},{"id":"c","text":"La cuire à basse température"},{"id":"d","text":"La faire lever"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'patisserie' and l.position = 3;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Quel est le rôle des blancs en neige dans une mousse ?',
  'Les blancs montés en neige incorporent de l''air, donnant à la préparation sa texture légère et aérienne.',
  '{"options":[{"id":"a","text":"Apporter du sucre"},{"id":"b","text":"Apporter de la légèreté et du volume"},{"id":"c","text":"Épaissir uniquement"},{"id":"d","text":"Colorer la préparation"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'patisserie' and l.position = 4;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « tempérer » le chocolat ?',
  'Tempérer le chocolat stabilise le beurre de cacao afin d''obtenir un chocolat brillant, cassant et qui ne blanchit pas.',
  '{"options":[{"id":"a","text":"Le faire fondre au micro-ondes rapidement"},{"id":"b","text":"Le faire fondre puis le refroidir selon une courbe précise"},{"id":"c","text":"Le mélanger avec du beurre"},{"id":"d","text":"Le congeler"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'patisserie' and l.position = 5;

-- ---------- BAR ET VINS ----------
insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Dans quel ordre sert-on généralement les vins lors d''un repas ?',
  'On sert traditionnellement le vin blanc avant le rouge, et un vin léger avant un vin plus corsé, pour respecter la progression des saveurs.',
  '{"options":[{"id":"a","text":"Rouge avant blanc, corsé avant léger"},{"id":"b","text":"Blanc avant rouge, léger avant corsé"},{"id":"c","text":"Peu importe l''ordre"},{"id":"d","text":"Toujours le plus cher en premier"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'bar-et-vins' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'À quelle température sert-on un vin rouge léger, type Beaujolais ?',
  'Les vins rouges légers se servent plus frais (14-16°C) que les vins rouges corsés, pour préserver leur fraîcheur.',
  '{"options":[{"id":"a","text":"Environ 6°C"},{"id":"b","text":"Environ 14-16°C"},{"id":"c","text":"Environ 25°C"},{"id":"d","text":"Toujours chambré à 22°C"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'bar-et-vins' and l.position = 2;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « chambrer » un vin ?',
  'Chambrer un vin consiste à le laisser atteindre la température ambiante d''une pièce fraîche, généralement autour de 16-18°C.',
  '{"options":[{"id":"a","text":"Le mettre au réfrigérateur"},{"id":"b","text":"L''amener progressivement à température ambiante"},{"id":"c","text":"Le servir glacé"},{"id":"d","text":"Le laisser respirer 24h"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'bar-et-vins' and l.position = 3;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Quel verre utilise-t-on classiquement pour un cocktail servi « on the rocks » ?',
  'Le verre old fashioned, large et bas, est destiné aux cocktails servis sur glaçons.',
  '{"options":[{"id":"a","text":"Une flûte"},{"id":"b","text":"Un verre old fashioned (tumbler bas)"},{"id":"c","text":"Une coupe à champagne"},{"id":"d","text":"Un verre à shot"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'bar-et-vins' and l.position = 4;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie l''accord mets-vins ?',
  'L''accord mets-vins consiste à sélectionner un vin dont les caractéristiques subliment le plat servi.',
  '{"options":[{"id":"a","text":"Servir uniquement du vin rouge avec de la viande"},{"id":"b","text":"Choisir un vin qui s''harmonise avec le plat servi"},{"id":"c","text":"Toujours servir le vin le plus cher"},{"id":"d","text":"Ne servir du vin qu''en dessert"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'bar-et-vins' and l.position = 5;

-- ---------- SERVICE — Leçon 1 : contenu complet demandé (3 types) ----------
insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Le service des boissons (eau, vin) s''effectue traditionnellement de quel côté du client ?',
  'Les boissons se servent par la droite du client, tout comme le débarrassage. Les mets, eux, se servent par la gauche.',
  '{"options":[{"id":"a","text":"Par la gauche du client"},{"id":"b","text":"Par la droite du client"},{"id":"c","text":"Peu importe le côté"},{"id":"d","text":"Toujours par-devant"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'associer', 2,
  'Associez chaque couvert ou verre à sa position correcte sur une table dressée classique.',
  'Les couverts se disposent de l''extérieur vers l''intérieur dans l''ordre de service des plats ; le verre à eau se place au-dessus de la pointe du couteau.',
  '{"pairs":[{"left":{"id":"l1","text":"Couteau de table"},"right":{"id":"r1","text":"À droite de l''assiette, tranchant vers l''assiette"}},{"left":{"id":"l2","text":"Fourchette de table"},"right":{"id":"r2","text":"À gauche de l''assiette"}},{"left":{"id":"l3","text":"Cuillère à soupe"},"right":{"id":"r3","text":"À droite du couteau"}},{"left":{"id":"l4","text":"Verre à eau"},"right":{"id":"r4","text":"Au-dessus de la pointe du couteau"}}]}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 3,
  'Que signifie « mise en place » en restauration ?',
  'La mise en place désigne toute la préparation (matériel, ingrédients, dressage) effectuée avant l''arrivée des clients.',
  '{"options":[{"id":"a","text":"Le pourboire laissé par le client"},{"id":"b","text":"La préparation du poste de travail avant le service"},{"id":"c","text":"Le nettoyage après le service"},{"id":"d","text":"Le menu du jour"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'ordonner', 4,
  'Remettez dans l''ordre les étapes de gestion d''une allergie signalée par un client.',
  'Face à une allergie, on identifie précisément l''allergène, on vérifie la fiche allergènes du plat, on informe la cuisine, puis on confirme au client avant de servir.',
  '{"steps":[{"id":"s1","text":"Identifier l''allergène signalé par le client"},{"id":"s2","text":"Vérifier la fiche allergènes du plat"},{"id":"s3","text":"Informer la cuisine"},{"id":"s4","text":"Confirmer au client avant le service"}]}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'ordonner', 5,
  'Remettez dans l''ordre les étapes d''accueil d''un client au restaurant.',
  'Un accueil réussi suit toujours cette séquence : sourire, salutation, vérification de la réservation, accompagnement, puis prise en charge avec le menu.',
  '{"steps":[{"id":"s1","text":"Accueillir le client avec le sourire et un contact visuel"},{"id":"s2","text":"Saluer verbalement et se présenter"},{"id":"s3","text":"Demander si le client a une réservation"},{"id":"s4","text":"Accompagner le client jusqu''à sa table"},{"id":"s5","text":"Présenter le menu et proposer une boisson d''accueil"}]}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 1;

-- ---------- SERVICE — Leçons 2 à 5 ----------
insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que doit-on faire avant de débarrasser l''assiette d''un client ?',
  'Par courtoisie, on évite de débarrasser un convive tant que d''autres n''ont pas terminé, sauf s''il le demande explicitement.',
  '{"options":[{"id":"a","text":"Attendre que tous les convives aient terminé, sauf demande contraire"},{"id":"b","text":"Débarrasser dès qu''un convive a fini"},{"id":"c","text":"Ne jamais débarrasser avant le café"},{"id":"d","text":"Demander l''addition d''abord"}],"correct_option_id":"a"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 2;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Comment présente-t-on l''addition à une table ?',
  'L''addition se présente discrètement sur un support dédié, généralement à la demande du client.',
  '{"options":[{"id":"a","text":"En la jetant sur la table"},{"id":"b","text":"Sur un support, face cachée, à la demande du client"},{"id":"c","text":"En criant le montant à voix haute"},{"id":"d","text":"Avant même la fin du repas"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 3;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « dresser une table » ?',
  'Dresser une table consiste à installer tout le matériel nécessaire (couverts, verres, serviette) avant l''accueil des clients.',
  '{"options":[{"id":"a","text":"Nettoyer la salle"},{"id":"b","text":"Installer couverts, verres et serviette avant l''arrivée des clients"},{"id":"c","text":"Prendre la commande"},{"id":"d","text":"Servir le plat principal"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 4;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Un client renverse son verre. Quelle est la bonne attitude ?',
  'Un incident se gère avec calme, rapidité et discrétion, en priorisant le confort du client.',
  '{"options":[{"id":"a","text":"L''ignorer, ce n''est pas grave"},{"id":"b","text":"Réagir rapidement, rassurer le client et nettoyer avec discrétion"},{"id":"c","text":"Faire une remarque au client"},{"id":"d","text":"Attendre la fin du repas pour nettoyer"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'service' and l.position = 5;

-- ---------- HÔTELLERIE ----------
insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « check-in » dans un hôtel ?',
  'Le check-in désigne le moment où le client arrive et est enregistré à la réception.',
  '{"options":[{"id":"a","text":"Le départ du client"},{"id":"b","text":"L''arrivée et l''enregistrement du client"},{"id":"c","text":"Le nettoyage de la chambre"},{"id":"d","text":"La réservation en ligne"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'hotellerie' and l.position = 1;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « check-out » ?',
  'Le check-out correspond au départ du client, avec la restitution de la chambre et le règlement final.',
  '{"options":[{"id":"a","text":"L''arrivée du client"},{"id":"b","text":"Le départ et le règlement final du client"},{"id":"c","text":"Le service en chambre"},{"id":"d","text":"La réservation d''une table"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'hotellerie' and l.position = 2;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que doit contenir une chambre correctement préparée avant l''arrivée d''un client ?',
  'Une chambre prête doit être entièrement nettoyée avec le linge changé, la salle de bain propre et les consommables réapprovisionnés.',
  '{"options":[{"id":"a","text":"Rien de particulier"},{"id":"b","text":"Lit fait, salle de bain propre, linge et consommables réapprovisionnés"},{"id":"c","text":"Uniquement les serviettes"},{"id":"d","text":"Le minibar vide"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'hotellerie' and l.position = 3;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Que signifie « room service » ?',
  'Le room service permet aux clients de commander à manger ou à boire directement dans leur chambre.',
  '{"options":[{"id":"a","text":"Le ménage des chambres"},{"id":"b","text":"Le service de repas/boissons livré directement en chambre"},{"id":"c","text":"La réception des bagages"},{"id":"d","text":"Le voiturier"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'hotellerie' and l.position = 4;

insert into public.questions (lecon_id, type, position, prompt, explanation, data)
select l.id, 'qcm', 1,
  'Un client se plaint du bruit dans sa chambre. Quelle est la meilleure réaction ?',
  'Face à une réclamation, il faut écouter activement, s''excuser et proposer une solution concrète pour restaurer la satisfaction du client.',
  '{"options":[{"id":"a","text":"Lui dire que ce n''est pas votre problème"},{"id":"b","text":"L''écouter, s''excuser et proposer une solution concrète"},{"id":"c","text":"Ignorer la plainte"},{"id":"d","text":"Lui proposer de partir"}],"correct_option_id":"b"}'::jsonb
from public.lecons l join public.filieres f on f.id = l.filiere_id
where f.slug = 'hotellerie' and l.position = 5;
