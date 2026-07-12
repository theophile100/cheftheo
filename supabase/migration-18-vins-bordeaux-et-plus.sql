-- Chef Theo - migration 18 : remplace les emplacements de vins trop vagues
-- (Bar et Vins) par de vrais noms d'appellations/vins. Ne touche a rien
-- d'autre (verres, spiritueux, outils de bar restent intacts).
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- ============================================================
-- Suppression des 8 emplacements vagues (uniquement ceux-la).
-- ============================================================

delete from public.materiel_items
where filiere_id = (select id from public.filieres where slug = 'bar-et-vins')
  and name in (
    'Vin rouge', 'Vin blanc', 'Vin rosé', 'Champagne', 'Crémant',
    'Vin liquoreux', 'Vin muté', 'Magnum'
  );

-- ============================================================
-- Ajout des 79 vrais noms de vins, a la suite, sans classement par
-- region (positions continuant apres le dernier emplacement existant,
-- numero explicite pour garantir l'ordre exact de la liste).
-- ============================================================

insert into public.materiel_items (filiere_id, name, position)
select (select id from public.filieres where slug = 'bar-et-vins'), name, 65 + ord
from (
  values
    (1, 'Médoc'), (2, 'Haut-Médoc'), (3, 'Saint-Estèphe'), (4, 'Pauillac'), (5, 'Saint-Julien'),
    (6, 'Margaux'), (7, 'Graves'), (8, 'Pessac-Léognan'), (9, 'Saint-Émilion'), (10, 'Pomerol'),
    (11, 'Fronsac'), (12, 'Bordeaux'), (13, 'Bordeaux Supérieur'), (14, 'Entre-Deux-Mers'), (15, 'Sauternes'),
    (16, 'Barsac'), (17, 'Crémant de Bordeaux'), (18, 'Gevrey-Chambertin'), (19, 'Vosne-Romanée'), (20, 'Nuits-Saint-Georges'),
    (21, 'Pommard'), (22, 'Volnay'), (23, 'Chablis'), (24, 'Meursault'), (25, 'Puligny-Montrachet'),
    (26, 'Pouilly-Fuissé'), (27, 'Bourgogne'), (28, 'Crémant de Bourgogne'), (29, 'Beaujolais'), (30, 'Morgon'),
    (31, 'Fleurie'), (32, 'Moulin-à-Vent'), (33, 'Brouilly'), (34, 'Côtes du Rhône'), (35, 'Châteauneuf-du-Pape'),
    (36, 'Gigondas'), (37, 'Crozes-Hermitage'), (38, 'Hermitage'), (39, 'Côte-Rôtie'), (40, 'Condrieu'),
    (41, 'Tavel'), (42, 'Muscadet'), (43, 'Sancerre'), (44, 'Pouilly-Fumé'), (45, 'Vouvray'),
    (46, 'Chinon'), (47, 'Bourgueil'), (48, 'Saumur-Champigny'), (49, 'Riesling'), (50, 'Gewurztraminer'),
    (51, 'Pinot Gris'), (52, 'Muscat d''Alsace'), (53, 'Crémant d''Alsace'), (54, 'Champagne Brut'), (55, 'Blanc de Blancs'),
    (56, 'Blanc de Noirs'), (57, 'Champagne Rosé'), (58, 'Champagne Millésimé'), (59, 'Demi-Sec'), (60, 'Côtes de Provence'),
    (61, 'Bandol'), (62, 'Languedoc'), (63, 'Corbières'), (64, 'Minervois'), (65, 'Cahors'),
    (66, 'Madiran'), (67, 'Bergerac'), (68, 'Monbazillac'), (69, 'Jurançon'), (70, 'Vin Jaune'),
    (71, 'Arbois'), (72, 'Crémant du Jura'), (73, 'Apremont'), (74, 'Rioja'), (75, 'Porto'),
    (76, 'Chianti'), (77, 'Barolo'), (78, 'Prosecco'), (79, 'Cava')
) as t(ord, name)
on conflict (filiere_id, name) do nothing;
