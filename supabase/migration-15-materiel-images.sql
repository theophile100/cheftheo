-- Chef Theo - migration 15 : emplacements de materiel (nom + image), par
-- filiere, geres depuis l'admin et utilises plus tard par les jeux.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create table public.materiel_items (
  id uuid primary key default gen_random_uuid(),
  filiere_id uuid not null references public.filieres(id) on delete cascade,
  name text not null,
  position integer not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.materiel_items enable row level security;

create policy "materiel_items readable by authenticated" on public.materiel_items
  for select to authenticated using (true);

-- Pas de policy d'ecriture : seul l'admin modifie (Server Action + service_role).

-- Espace de stockage dedie aux images de materiel.
insert into storage.buckets (id, name, public)
values ('materiel', 'materiel', true)
on conflict (id) do nothing;

-- ============================================================
-- Emplacements par filiere (75 au total), sans image au depart (neutre).
-- ============================================================

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'service'), name, position
from (
  values
    ('Assiette plate', 1),
    ('Assiette creuse', 2),
    ('Assiette à pain', 3),
    ('Assiette de présentation', 4),
    ('Fourchette de table', 5),
    ('Fourchette à entrée', 6),
    ('Fourchette à poisson', 7),
    ('Fourchette à dessert', 8),
    ('Couteau de table', 9),
    ('Couteau à poisson', 10),
    ('Couteau à beurre', 11),
    ('Cuillère à soupe', 12),
    ('Cuillère à dessert', 13),
    ('Verre à eau', 14),
    ('Verre à vin rouge', 15),
    ('Verre à vin blanc', 16),
    ('Flûte à champagne', 17),
    ('Serviette', 18)
) as t(name, position)

union all

select (select id from public.filieres where slug = 'cuisine'), name, position
from (
  values
    ('Couteau de chef', 1),
    ('Couteau d''office', 2),
    ('Couteau à désosser', 3),
    ('Couteau filet de sole', 4),
    ('Éplucheur', 5),
    ('Planche à découper', 6),
    ('Fouet', 7),
    ('Spatule', 8),
    ('Louche', 9),
    ('Écumoire', 10),
    ('Casserole', 11),
    ('Sauteuse', 12),
    ('Russe (petite casserole)', 13),
    ('Plaque de cuisson', 14),
    ('Cul-de-poule', 15),
    ('Chinois (passoire fine)', 16)
) as t(name, position)

union all

select (select id from public.filieres where slug = 'patisserie'), name, position
from (
  values
    ('Balance', 1),
    ('Fouet', 2),
    ('Maryse (spatule souple)', 3),
    ('Rouleau à pâtisserie', 4),
    ('Poche à douille', 5),
    ('Douilles', 6),
    ('Moule à tarte', 7),
    ('Moule à cake', 8),
    ('Cercle à entremets', 9),
    ('Tamis', 10),
    ('Corne', 11),
    ('Thermomètre', 12),
    ('Pinceau', 13),
    ('Palette', 14),
    ('Plaque à pâtisserie', 15)
) as t(name, position)

union all

select (select id from public.filieres where slug = 'bar-et-vins'), name, position
from (
  values
    ('Shaker', 1),
    ('Doseur (jigger)', 2),
    ('Pilon (muddler)', 3),
    ('Cuillère à mélange', 4),
    ('Passoire (strainer)', 5),
    ('Verre à mélange', 6),
    ('Verre à cocktail', 7),
    ('Verre highball', 8),
    ('Verre old-fashioned', 9),
    ('Flûte', 10),
    ('Verre à vin', 11),
    ('Tire-bouchon', 12),
    ('Bec verseur', 13),
    ('Seau à glace', 14)
) as t(name, position)

union all

select (select id from public.filieres where slug = 'hotellerie'), name, position
from (
  values
    ('Chariot de ménage', 1),
    ('Linge de lit (draps)', 2),
    ('Taies d''oreiller', 3),
    ('Serviettes de bain', 4),
    ('Produits d''accueil', 5),
    ('Aspirateur', 6),
    ('Chiffons', 7),
    ('Produits d''entretien', 8),
    ('Plateau de courtoisie', 9),
    ('Bouilloire', 10),
    ('Panier à linge', 11),
    ('Pancarte "ne pas déranger"', 12)
) as t(name, position);
