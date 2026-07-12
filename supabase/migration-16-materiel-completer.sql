-- Chef Theo - migration 16 : complete les emplacements de materiel par
-- filiere avec les elements manquants (aucun doublon, rien touche parmi les
-- 75 emplacements existants). Voir le recapitulatif donne a l'utilisateur
-- pour le detail des correspondances jugees deja existantes.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- Garde-fou technique en plus de la verification manuelle : empeche tout
-- doublon exact (meme nom dans la meme filiere), y compris si cette
-- migration etait relancee par erreur.
alter table public.materiel_items add constraint materiel_items_filiere_name_unique unique (filiere_id, name);

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'service'), name, position
from (
  values
    ('Assiette à dessert', 19),
    ('Ravier', 20),
    ('Tasse à café + sous-tasse', 21),
    ('Tasse à thé', 22),
    ('Bol', 23),
    ('Fourchette à huîtres', 24),
    ('Fourchette à escargots', 25),
    ('Couteau à steak', 26),
    ('Couteau à fromage', 27),
    ('Cuillère à entremets', 28),
    ('Cuillère à café', 29),
    ('Cuillère à moka', 30),
    ('Coupe à champagne', 31),
    ('Verre à porto', 32),
    ('Nappe', 33),
    ('Molleton', 34),
    ('Set de table', 35),
    ('Salière et poivrière', 36),
    ('Huilier', 37),
    ('Corbeille à pain', 38),
    ('Seau à champagne', 39),
    ('Plateau de service', 40),
    ('Guéridon', 41),
    ('Cloche de service', 42),
    ('Pince de service', 43),
    ('Rince-doigts', 44)
) as t(name, position)
on conflict (filiere_id, name) do nothing;

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'cuisine'), name, position
from (
  values
    ('Couteau à pain', 17),
    ('Couteau santoku', 18),
    ('Feuille/couperet', 19),
    ('Mandoline', 20),
    ('Zesteur', 21),
    ('Fusil à aiguiser', 22),
    ('Pierre à aiguiser', 23),
    ('Maryse', 24),
    ('Cuillère en bois', 25),
    ('Araignée', 26),
    ('Pince de cuisine', 27),
    ('Presse-purée', 28),
    ('Rouleau à pâtisserie', 29),
    ('Corne', 30),
    ('Pinceau de cuisine', 31),
    ('Saladier', 32),
    ('Bol', 33),
    ('Balance', 34),
    ('Verre doseur', 35),
    ('Passoire', 36),
    ('Tamis', 37),
    ('Entonnoir', 38),
    ('Poêle', 39),
    ('Sautoir', 40),
    ('Faitout', 41),
    ('Cocotte', 42),
    ('Wok', 43),
    ('Plaque à rôtir', 44),
    ('Bain-marie', 45),
    ('Rondeau', 46),
    ('Piano (fourneau)', 47),
    ('Four', 48),
    ('Salamandre', 49),
    ('Friteuse', 50),
    ('Batteur/robot', 51),
    ('Mixeur plongeant', 52),
    ('Trancheuse', 53),
    ('Cellule de refroidissement', 54),
    ('Chambre froide', 55)
) as t(name, position)
on conflict (filiere_id, name) do nothing;

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'patisserie'), name, position
from (
  values
    ('Verre doseur', 16),
    ('Thermomètre à sucre', 17),
    ('Passoire fine', 18),
    ('Batteur/robot pâtissier', 19),
    ('Cuillère en bois', 20),
    ('Laminoir', 21),
    ('Tapis silicone', 22),
    ('Papier cuisson', 23),
    ('Coupe-pâte', 24),
    ('Emporte-pièces', 25),
    ('Roulette à pâtisserie', 26),
    ('Douille unie', 27),
    ('Douille cannelée', 28),
    ('Douille Saint-Honoré', 29),
    ('Cercle à tarte', 30),
    ('Moule à manqué', 31),
    ('Moule à muffins', 32),
    ('Moule silicone', 33),
    ('Moule à savarin', 34),
    ('Caissettes', 35),
    ('Grille de refroidissement', 36),
    ('Chalumeau', 37),
    ('Chinois', 38),
    ('Poêlon en cuivre', 39)
) as t(name, position)
on conflict (filiere_id, name) do nothing;

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'bar-et-vins'), name, position
from (
  values
    ('Passoire fine', 15),
    ('Centrifugeuse/blender', 16),
    ('Presse-agrumes', 17),
    ('Couteau d''office', 18),
    ('Planche', 19),
    ('Verre coupe', 20),
    ('Verre long drink', 21),
    ('Verre shot', 22),
    ('Chope à bière', 23),
    ('Verre à bière', 24),
    ('Verre à vin rouge', 25),
    ('Verre à vin blanc', 26),
    ('Verre à digestif', 27),
    ('Verre à cognac', 28),
    ('Vin rouge', 29),
    ('Vin blanc', 30),
    ('Vin rosé', 31),
    ('Champagne', 32),
    ('Crémant', 33),
    ('Vin liquoreux', 34),
    ('Vin muté', 35),
    ('Magnum', 36),
    ('Rhum blanc', 37),
    ('Rhum ambré', 38),
    ('Vodka', 39),
    ('Gin', 40),
    ('Whisky', 41),
    ('Bourbon', 42),
    ('Tequila', 43),
    ('Cognac', 44),
    ('Armagnac', 45),
    ('Calvados', 46),
    ('Triple sec', 47),
    ('Curaçao', 48),
    ('Campari', 49),
    ('Vermouth rouge', 50),
    ('Vermouth blanc', 51),
    ('Aperol', 52),
    ('Liqueur de café', 53),
    ('Liqueur de menthe', 54),
    ('Sirop', 55),
    ('Bière blonde', 56),
    ('Bière brune', 57),
    ('Bière ambrée', 58),
    ('Bière IPA', 59),
    ('Eau plate', 60),
    ('Eau gazeuse', 61),
    ('Soda/tonic', 62),
    ('Jus de fruits', 63),
    ('Café', 64),
    ('Thé', 65)
) as t(name, position)
on conflict (filiere_id, name) do nothing;

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'hotellerie'), name, position
from (
  values
    ('Balai/serpillière', 13),
    ('Gants de ménage', 14),
    ('Pancarte "Chambre à faire"', 15),
    ('Housse de couette', 16),
    ('Couverture/plaid', 17),
    ('Serviette de toilette', 18),
    ('Tapis de bain', 19),
    ('Peignoir', 20),
    ('Chaussons', 21),
    ('Tasses/mugs', 22),
    ('Sachets thé et café', 23),
    ('Corbeille de fruits', 24),
    ('Carte de bienvenue', 25),
    ('Minibar', 26),
    ('Comptoir de réception', 27),
    ('Téléphone', 28),
    ('Clés/cartes', 29),
    ('Registre/cardex', 30),
    ('Porte-bagages', 31),
    ('Coffre-fort', 32)
) as t(name, position)
on conflict (filiere_id, name) do nothing;
