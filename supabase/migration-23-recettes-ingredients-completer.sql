-- Chef Theo - migration 23 : complete les categories "Recettes" et
-- "Legumes et ingredients" de la filiere Cuisine avec les nouvelles
-- recettes et les ingredients qui n'existaient pas encore. Ajoute un champ
-- ingredients (texte pre-rempli, modifiable) sur les emplacements de
-- recette. Rien touche parmi les emplacements deja existants -- voir le
-- recapitulatif donne a l'utilisateur pour le detail des correspondances
-- jugees deja existantes.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.materiel_items add column ingredients text;

insert into public.materiel_items (filiere_id, name, position, categorie, sous_groupe, ingredients)
values
  ((select id from public.filieres where slug = 'cuisine'), 'Crudités variées', 242, 'Recettes', 'Hors-d''œuvre froids', 'carottes, tomates, concombre, betterave, chou, vinaigrette'),
  ((select id from public.filieres where slug = 'cuisine'), 'Avocat au crabe', 243, 'Recettes', 'Hors-d''œuvre froids', 'avocat, chair de crabe, citron, mayonnaise, persil'),
  ((select id from public.filieres where slug = 'cuisine'), 'Spaghettis bolognaise', 244, 'Recettes', 'Hors-d''œuvre chauds', 'spaghettis, viande hachée, tomate, oignon, ail, carotte, huile d''olive, parmesan'),
  ((select id from public.filieres where slug = 'cuisine'), 'Darne de colin sauce mousseline', 245, 'Recettes', 'Poisson', 'colin, sauce mousseline (jaune d''œuf, beurre, crème fouettée), pommes vapeur'),
  ((select id from public.filieres where slug = 'cuisine'), 'Filet de sole bonne femme', 246, 'Recettes', 'Poisson', 'filet de sole, échalote, champignons, vin blanc, fumet, crème, jaune d''œuf, beurre'),
  ((select id from public.filieres where slug = 'cuisine'), 'Petits filets Stroganoff', 247, 'Recettes', 'Viande', 'filet de bœuf, oignon, crème, moutarde, paprika, cornichons, riz pilaf'),
  ((select id from public.filieres where slug = 'cuisine'), 'Estouffade de bœuf provençale', 248, 'Recettes', 'Viande', 'bœuf, vin rouge, tomate, olives, ail, oignon, herbes de Provence, zeste d''orange'),
  ((select id from public.filieres where slug = 'cuisine'), 'Navarin printanier', 249, 'Recettes', 'Viande', 'agneau, carotte, navet, pomme de terre, petits pois, oignon, tomate, ail, bouquet garni'),
  ((select id from public.filieres where slug = 'cuisine'), 'Crème renversée au caramel', 250, 'Recettes', 'Desserts', 'lait, œufs, sucre, vanille, caramel'),
  ((select id from public.filieres where slug = 'cuisine'), 'Pot de crème', 251, 'Recettes', 'Desserts', 'lait, jaunes d''œufs, sucre (café, vanille, chocolat)'),
  ((select id from public.filieres where slug = 'cuisine'), 'Mousse au chocolat', 252, 'Recettes', 'Desserts', 'chocolat, blancs d''œufs, jaunes d''œufs, sucre, beurre'),
  ((select id from public.filieres where slug = 'cuisine'), 'Œufs à la neige', 253, 'Recettes', 'Desserts', 'lait, blancs d''œufs, sucre, crème anglaise (jaunes d''œufs, lait, sucre, vanille)'),
  ((select id from public.filieres where slug = 'cuisine'), 'Beignets de pommes', 254, 'Recettes', 'Desserts', 'pommes, pâte à beignets (farine, œuf, bière ou lait), sucre, huile'),
  ((select id from public.filieres where slug = 'cuisine'), 'Crêpes au sucre', 255, 'Recettes', 'Desserts', 'farine, œufs, lait, beurre, sucre'),
  ((select id from public.filieres where slug = 'cuisine'), 'Choux chantilly', 256, 'Recettes', 'Desserts', 'pâte à choux (eau, beurre, farine, œufs), crème chantilly'),
  ((select id from public.filieres where slug = 'cuisine'), 'Choux à la crème et éclairs', 257, 'Recettes', 'Desserts', 'pâte à choux, crème pâtissière (lait, jaunes d''œufs, sucre, farine), glaçage café/chocolat'),
  ((select id from public.filieres where slug = 'cuisine'), 'Génoise crème anglaise', 258, 'Recettes', 'Desserts', 'génoise (œufs, sucre, farine), crème anglaise (jaunes d''œufs, lait, sucre, vanille)'),
  ((select id from public.filieres where slug = 'cuisine'), 'Moka', 259, 'Recettes', 'Desserts', 'génoise, crème au beurre au café (beurre, sucre, œufs, café)'),
  ((select id from public.filieres where slug = 'cuisine'), 'Mille-feuilles', 260, 'Recettes', 'Desserts', 'pâte feuilletée, crème pâtissière, glaçage'),
  ((select id from public.filieres where slug = 'cuisine'), 'Tarte à l''alsacienne', 261, 'Recettes', 'Desserts', 'pâte brisée, pommes ou quetsches, œufs, crème, sucre'),
  ((select id from public.filieres where slug = 'cuisine'), 'Tarte feuilletée aux fruits', 262, 'Recettes', 'Desserts', 'pâte feuilletée, fruits, crème pâtissière, nappage'),
  ((select id from public.filieres where slug = 'cuisine'), 'Tarte aux pommes', 263, 'Recettes', 'Desserts', 'pâte brisée, pommes, sucre, beurre, cannelle'),
  ((select id from public.filieres where slug = 'cuisine'), 'Glace', 264, 'Recettes', 'Desserts', 'lait, jaunes d''œufs, sucre, crème (vanille, café, chocolat)'),
  ((select id from public.filieres where slug = 'cuisine'), 'Salade de fruits', 265, 'Recettes', 'Desserts', 'pomme, poire, banane, orange, ananas, fraise, sucre, citron')
on conflict (filiere_id, name) do nothing;

insert into public.materiel_items (filiere_id, name, position, categorie, sous_groupe)
values
  ((select id from public.filieres where slug = 'cuisine'), 'Muscade', 266, 'Légumes et ingrédients', 'Aromates et herbes'),
  ((select id from public.filieres where slug = 'cuisine'), 'Paprika', 267, 'Légumes et ingrédients', 'Aromates et herbes'),
  ((select id from public.filieres where slug = 'cuisine'), 'Cannelle', 268, 'Légumes et ingrédients', 'Aromates et herbes'),
  ((select id from public.filieres where slug = 'cuisine'), 'Poivre', 269, 'Légumes et ingrédients', 'Aromates et herbes'),
  ((select id from public.filieres where slug = 'cuisine'), 'Herbes de Provence', 270, 'Légumes et ingrédients', 'Aromates et herbes'),
  ((select id from public.filieres where slug = 'cuisine'), 'Vanille', 271, 'Légumes et ingrédients', 'Aromates et herbes'),
  ((select id from public.filieres where slug = 'cuisine'), 'Crabe', 272, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Thon', 273, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Olive', 274, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Anchois', 275, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Lardons', 276, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Fromage', 277, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Viande hachée', 278, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Jambon', 279, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Colin', 280, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Sole', 281, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Vin blanc', 282, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Veau', 283, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Bouquet garni', 284, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Bœuf', 285, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Cornichon', 286, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Cognac', 287, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Vin rouge', 288, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Agneau', 289, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Poulet', 290, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Sucre', 291, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Chocolat', 292, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Café', 293, 'Légumes et ingrédients', 'Autres ingrédients'),
  ((select id from public.filieres where slug = 'cuisine'), 'Bière', 294, 'Légumes et ingrédients', 'Autres ingrédients')
on conflict (filiere_id, name) do nothing;
