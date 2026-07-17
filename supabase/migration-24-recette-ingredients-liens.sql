-- Chef Theo - migration 24 : lien structure entre chaque recette et ses
-- ingredients (au lieu du texte libre), pour que l'image televersee une
-- fois sur un ingredient (Legumes et ingredients / Fruits) apparaisse
-- automatiquement partout ou cet ingredient est utilise. Les preparations
-- composees (mayonnaise, pate brisee, bechamel, caramel...) n'ont pas leur
-- propre emplacement image : seuls leurs composants de base deja presents
-- sont lies. Rien touche parmi les emplacements existants.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create table if not exists public.recette_ingredients (
  id uuid primary key default gen_random_uuid(),
  recette_id uuid not null references public.materiel_items(id) on delete cascade,
  ingredient_id uuid not null references public.materiel_items(id) on delete cascade,
  position integer not null,
  unique (recette_id, ingredient_id)
);

alter table public.recette_ingredients enable row level security;

drop policy if exists "recette_ingredients readable by authenticated" on public.recette_ingredients;
create policy "recette_ingredients readable by authenticated" on public.recette_ingredients
  for select to authenticated using (true);

insert into public.recette_ingredients (recette_id, ingredient_id, position)
values
  ('9ff9e77a-ca5e-4930-8727-71464ad0251b', 'd194a03a-ee4d-4efd-8e69-bf80176b258d', 1), -- Crudités variées <- Carotte
  ('9ff9e77a-ca5e-4930-8727-71464ad0251b', '57a9dad2-3834-46c3-9049-06984f79ccbe', 2), -- Crudités variées <- Tomate
  ('9ff9e77a-ca5e-4930-8727-71464ad0251b', 'a706b79a-edd8-49f3-9bad-d4fb32591258', 3), -- Crudités variées <- Concombre
  ('9ff9e77a-ca5e-4930-8727-71464ad0251b', '40bf7d20-04a1-44ee-ac80-a688f0b0a28a', 4), -- Crudités variées <- Betterave
  ('9ff9e77a-ca5e-4930-8727-71464ad0251b', 'a42760a3-a690-426d-9017-9beeca248551', 5), -- Crudités variées <- Chou
  ('9f11b6d3-04db-4a97-989c-ae989324830c', 'd194a03a-ee4d-4efd-8e69-bf80176b258d', 1), -- Macédoine de légumes mayonnaise <- Carotte
  ('9f11b6d3-04db-4a97-989c-ae989324830c', 'b7926c84-dc91-4c8b-a1ea-97812d6a3036', 2), -- Macédoine de légumes mayonnaise <- Petit pois
  ('9f11b6d3-04db-4a97-989c-ae989324830c', '9e43fc13-700b-4227-8d8d-f2bbea442ae4', 3), -- Macédoine de légumes mayonnaise <- Haricot vert
  ('9f11b6d3-04db-4a97-989c-ae989324830c', '8cfef6d9-e42b-4d93-a82d-bf509346d75c', 4), -- Macédoine de légumes mayonnaise <- Navet
  ('9f11b6d3-04db-4a97-989c-ae989324830c', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 5), -- Macédoine de légumes mayonnaise <- Pomme de terre
  ('9f11b6d3-04db-4a97-989c-ae989324830c', 'fa316777-9af4-4615-b436-c5f5f1e55888', 6), -- Macédoine de légumes mayonnaise <- Œuf
  ('9f11b6d3-04db-4a97-989c-ae989324830c', 'e0696740-2dfa-4ac3-a122-06dd1baa7ceb', 7), -- Macédoine de légumes mayonnaise <- Huile
  ('9f11b6d3-04db-4a97-989c-ae989324830c', '8421945f-5157-4b00-b190-bd36c3d67923', 8), -- Macédoine de légumes mayonnaise <- Moutarde
  ('6b1f7f46-b424-4c75-ac3d-dbaa49c6a643', '1dbbd532-5d71-4bd7-b6ef-e8ec774e0d94', 1), -- Avocat au crabe <- Avocat
  ('6b1f7f46-b424-4c75-ac3d-dbaa49c6a643', 'a8ed35d9-bbdd-4fe9-adbc-3d124504f6aa', 2), -- Avocat au crabe <- Crabe
  ('6b1f7f46-b424-4c75-ac3d-dbaa49c6a643', 'adeadcd9-b5ce-4fa5-b4f5-50f365f1e8ce', 3), -- Avocat au crabe <- Citron
  ('6b1f7f46-b424-4c75-ac3d-dbaa49c6a643', '70e81d7e-8206-40bb-ad7c-8f0b971d49ea', 4), -- Avocat au crabe <- Persil
  ('6762517d-32cc-417d-8b77-70134ad5f552', 'e926621b-85d9-4ff0-8fa1-1e9ae788ed67', 1), -- Salade façon niçoise <- Thon
  ('6762517d-32cc-417d-8b77-70134ad5f552', '57a9dad2-3834-46c3-9049-06984f79ccbe', 2), -- Salade façon niçoise <- Tomate
  ('6762517d-32cc-417d-8b77-70134ad5f552', 'fa316777-9af4-4615-b436-c5f5f1e55888', 3), -- Salade façon niçoise <- Œuf
  ('6762517d-32cc-417d-8b77-70134ad5f552', '9e43fc13-700b-4227-8d8d-f2bbea442ae4', 4), -- Salade façon niçoise <- Haricot vert
  ('6762517d-32cc-417d-8b77-70134ad5f552', '146043ea-6453-46a4-865f-efa3d3759e98', 5), -- Salade façon niçoise <- Olive
  ('6762517d-32cc-417d-8b77-70134ad5f552', '8139e5b2-0448-4946-954f-9f7a64c33020', 6), -- Salade façon niçoise <- Poivron
  ('6762517d-32cc-417d-8b77-70134ad5f552', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 7), -- Salade façon niçoise <- Oignon
  ('6762517d-32cc-417d-8b77-70134ad5f552', '7631659d-5f7f-4bb4-adef-ac7a572edb04', 8), -- Salade façon niçoise <- Anchois
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 1), -- Quiche lorraine <- Farine
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', 'edf2b853-9094-4512-b20f-f5f28357037a', 2), -- Quiche lorraine <- Beurre
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', 'fa316777-9af4-4615-b436-c5f5f1e55888', 3), -- Quiche lorraine <- Œuf
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', 'f35186e7-04fa-4e1e-a975-be7b127357ee', 4), -- Quiche lorraine <- Lardons
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', '9b8f8562-4086-4705-9056-9a9b58da79fd', 5), -- Quiche lorraine <- Crème
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 6), -- Quiche lorraine <- Lait
  ('ba2ebbaa-db39-4a4d-8c2c-2ef086039e48', '53d74ac7-a9cf-40c9-905a-8aac09580843', 7), -- Quiche lorraine <- Muscade
  ('582aaf60-10a9-417e-b2ca-d6ae0ba928bc', 'bd555e5c-10ff-4fd8-b91e-81d51dbd3c42', 1), -- Allumette au fromage <- Fromage
  ('582aaf60-10a9-417e-b2ca-d6ae0ba928bc', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Allumette au fromage <- Œuf
  ('193e3763-12e8-4c46-924d-0edd3a1a4751', '69c3bc92-919a-49f5-abf0-a9e7b6ae4e21', 1), -- Petit pâté feuilleté <- Viande hachée
  ('193e3763-12e8-4c46-924d-0edd3a1a4751', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 2), -- Petit pâté feuilleté <- Oignon
  ('193e3763-12e8-4c46-924d-0edd3a1a4751', '70e81d7e-8206-40bb-ad7c-8f0b971d49ea', 3), -- Petit pâté feuilleté <- Persil
  ('193e3763-12e8-4c46-924d-0edd3a1a4751', 'fa316777-9af4-4615-b436-c5f5f1e55888', 4), -- Petit pâté feuilleté <- Œuf
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', '8703923a-01eb-4be7-8a24-81e76ab3ccfa', 1), -- Spaghettis bolognaise <- Pâtes
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', '69c3bc92-919a-49f5-abf0-a9e7b6ae4e21', 2), -- Spaghettis bolognaise <- Viande hachée
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', '57a9dad2-3834-46c3-9049-06984f79ccbe', 3), -- Spaghettis bolognaise <- Tomate
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 4), -- Spaghettis bolognaise <- Oignon
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', '793d04ad-abc7-43e1-91dc-1eb4fdaee894', 5), -- Spaghettis bolognaise <- Ail
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', 'd194a03a-ee4d-4efd-8e69-bf80176b258d', 6), -- Spaghettis bolognaise <- Carotte
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', 'e0696740-2dfa-4ac3-a122-06dd1baa7ceb', 7), -- Spaghettis bolognaise <- Huile
  ('ffc0fe2b-7757-41f7-a407-5ebf08f41ead', 'bd555e5c-10ff-4fd8-b91e-81d51dbd3c42', 8), -- Spaghettis bolognaise <- Fromage
  ('9b429112-d72f-40c3-a89e-ba7220a64eb2', 'fa316777-9af4-4615-b436-c5f5f1e55888', 1), -- Œufs mollet florentine <- Œuf
  ('9b429112-d72f-40c3-a89e-ba7220a64eb2', 'a32a26d8-371d-424c-b8f6-2b7bc7a074dc', 2), -- Œufs mollet florentine <- Épinard
  ('9b429112-d72f-40c3-a89e-ba7220a64eb2', 'bd555e5c-10ff-4fd8-b91e-81d51dbd3c42', 3), -- Œufs mollet florentine <- Fromage
  ('fb86d493-1a5e-4d45-aef7-42660e452440', 'fa316777-9af4-4615-b436-c5f5f1e55888', 1), -- Œufs farcis Chimay <- Œuf
  ('fb86d493-1a5e-4d45-aef7-42660e452440', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 2), -- Œufs farcis Chimay <- Champignon de Paris
  ('fb86d493-1a5e-4d45-aef7-42660e452440', '37ea817e-d33c-4ef5-837b-ebff4b01c33b', 3), -- Œufs farcis Chimay <- Échalote
  ('fb86d493-1a5e-4d45-aef7-42660e452440', 'bd555e5c-10ff-4fd8-b91e-81d51dbd3c42', 4), -- Œufs farcis Chimay <- Fromage
  ('c4ad8d71-2111-46ef-ae56-95c388a7d99b', 'fa316777-9af4-4615-b436-c5f5f1e55888', 1), -- Œufs brouillés à la portugaise <- Œuf
  ('c4ad8d71-2111-46ef-ae56-95c388a7d99b', 'edf2b853-9094-4512-b20f-f5f28357037a', 2), -- Œufs brouillés à la portugaise <- Beurre
  ('c4ad8d71-2111-46ef-ae56-95c388a7d99b', '57a9dad2-3834-46c3-9049-06984f79ccbe', 3), -- Œufs brouillés à la portugaise <- Tomate
  ('c4ad8d71-2111-46ef-ae56-95c388a7d99b', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 4), -- Œufs brouillés à la portugaise <- Oignon
  ('c4ad8d71-2111-46ef-ae56-95c388a7d99b', '793d04ad-abc7-43e1-91dc-1eb4fdaee894', 5), -- Œufs brouillés à la portugaise <- Ail
  ('f515b423-5dad-438a-8810-b1ad7c74d793', 'fa316777-9af4-4615-b436-c5f5f1e55888', 1), -- Omelette aux fines herbes <- Œuf
  ('f515b423-5dad-438a-8810-b1ad7c74d793', '70e81d7e-8206-40bb-ad7c-8f0b971d49ea', 2), -- Omelette aux fines herbes <- Persil
  ('f515b423-5dad-438a-8810-b1ad7c74d793', '8f8fd133-95a9-4a64-8a84-7680ee49d6ba', 3), -- Omelette aux fines herbes <- Ciboulette
  ('f515b423-5dad-438a-8810-b1ad7c74d793', '8f8052bd-2fcb-4828-a86c-4061314532f4', 4), -- Omelette aux fines herbes <- Cerfeuil
  ('f515b423-5dad-438a-8810-b1ad7c74d793', 'c01d56f1-273e-4fbe-84e0-96bc0858987a', 5), -- Omelette aux fines herbes <- Estragon
  ('f515b423-5dad-438a-8810-b1ad7c74d793', 'edf2b853-9094-4512-b20f-f5f28357037a', 6), -- Omelette aux fines herbes <- Beurre
  ('f515b423-5dad-438a-8810-b1ad7c74d793', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 7), -- Omelette aux fines herbes <- Champignon de Paris
  ('f515b423-5dad-438a-8810-b1ad7c74d793', 'bbf6ce88-2209-4b05-93f2-3076efde45ef', 8), -- Omelette aux fines herbes <- Jambon
  ('f515b423-5dad-438a-8810-b1ad7c74d793', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 9), -- Omelette aux fines herbes <- Oignon
  ('deb0b303-360f-45da-b6c3-fe2ff11abfe1', 'fa316777-9af4-4615-b436-c5f5f1e55888', 1), -- Omelette plate à l'espagnole <- Œuf
  ('deb0b303-360f-45da-b6c3-fe2ff11abfe1', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 2), -- Omelette plate à l'espagnole <- Pomme de terre
  ('deb0b303-360f-45da-b6c3-fe2ff11abfe1', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 3), -- Omelette plate à l'espagnole <- Oignon
  ('deb0b303-360f-45da-b6c3-fe2ff11abfe1', '8139e5b2-0448-4946-954f-9f7a64c33020', 4), -- Omelette plate à l'espagnole <- Poivron
  ('deb0b303-360f-45da-b6c3-fe2ff11abfe1', '57a9dad2-3834-46c3-9049-06984f79ccbe', 5), -- Omelette plate à l'espagnole <- Tomate
  ('deb0b303-360f-45da-b6c3-fe2ff11abfe1', 'e0696740-2dfa-4ac3-a122-06dd1baa7ceb', 6), -- Omelette plate à l'espagnole <- Huile
  ('1b099062-b46c-4215-99b2-5f2bd3e7cfd3', 'baf81dd6-669b-43cd-9b6f-250de4ef1f6a', 1), -- Darne de colin sauce mousseline <- Colin
  ('1b099062-b46c-4215-99b2-5f2bd3e7cfd3', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Darne de colin sauce mousseline <- Œuf
  ('1b099062-b46c-4215-99b2-5f2bd3e7cfd3', 'edf2b853-9094-4512-b20f-f5f28357037a', 3), -- Darne de colin sauce mousseline <- Beurre
  ('1b099062-b46c-4215-99b2-5f2bd3e7cfd3', '9b8f8562-4086-4705-9056-9a9b58da79fd', 4), -- Darne de colin sauce mousseline <- Crème
  ('1b099062-b46c-4215-99b2-5f2bd3e7cfd3', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 5), -- Darne de colin sauce mousseline <- Pomme de terre
  ('5fba52f5-913a-4248-bb82-c0b5c6dbc78e', '9df8b642-415b-4efc-b791-e7b88d3aa05b', 1), -- Sole meunière <- Sole
  ('5fba52f5-913a-4248-bb82-c0b5c6dbc78e', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 2), -- Sole meunière <- Farine
  ('5fba52f5-913a-4248-bb82-c0b5c6dbc78e', 'edf2b853-9094-4512-b20f-f5f28357037a', 3), -- Sole meunière <- Beurre
  ('5fba52f5-913a-4248-bb82-c0b5c6dbc78e', 'adeadcd9-b5ce-4fa5-b4f5-50f365f1e8ce', 4), -- Sole meunière <- Citron
  ('5fba52f5-913a-4248-bb82-c0b5c6dbc78e', '70e81d7e-8206-40bb-ad7c-8f0b971d49ea', 5), -- Sole meunière <- Persil
  ('5fba52f5-913a-4248-bb82-c0b5c6dbc78e', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 6), -- Sole meunière <- Pomme de terre
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', '9df8b642-415b-4efc-b791-e7b88d3aa05b', 1), -- Filet de sole bonne femme <- Sole
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', '37ea817e-d33c-4ef5-837b-ebff4b01c33b', 2), -- Filet de sole bonne femme <- Échalote
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 3), -- Filet de sole bonne femme <- Champignon de Paris
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', '6a8ff19f-0d0c-4030-bf2f-0c233b3d6c02', 4), -- Filet de sole bonne femme <- Vin blanc
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', '9b8f8562-4086-4705-9056-9a9b58da79fd', 5), -- Filet de sole bonne femme <- Crème
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', 'fa316777-9af4-4615-b436-c5f5f1e55888', 6), -- Filet de sole bonne femme <- Œuf
  ('de5c82c5-e634-4d74-b7c9-6c53964cee26', 'edf2b853-9094-4512-b20f-f5f28357037a', 7), -- Filet de sole bonne femme <- Beurre
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', '023b0620-d770-40fb-8f96-40a777835925', 1), -- Blanquette de veau à l'ancienne <- Veau
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', 'd194a03a-ee4d-4efd-8e69-bf80176b258d', 2), -- Blanquette de veau à l'ancienne <- Carotte
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 3), -- Blanquette de veau à l'ancienne <- Oignon
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', 'c349d8ef-0891-4dcc-aedd-9e5332804677', 4), -- Blanquette de veau à l'ancienne <- Bouquet garni
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 5), -- Blanquette de veau à l'ancienne <- Champignon de Paris
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', '9b8f8562-4086-4705-9056-9a9b58da79fd', 6), -- Blanquette de veau à l'ancienne <- Crème
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', 'fa316777-9af4-4615-b436-c5f5f1e55888', 7), -- Blanquette de veau à l'ancienne <- Œuf
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', 'edf2b853-9094-4512-b20f-f5f28357037a', 8), -- Blanquette de veau à l'ancienne <- Beurre
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 9), -- Blanquette de veau à l'ancienne <- Farine
  ('2fedd32e-29a6-4b1e-a596-6b610f56c763', '391cd541-bc4a-4667-825c-3da62ae8508c', 10), -- Blanquette de veau à l'ancienne <- Riz
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', 'b1b29163-31ac-4ed8-bf32-203c9d8ae10b', 1), -- Petits filets Stroganoff <- Bœuf
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 2), -- Petits filets Stroganoff <- Oignon
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', '9b8f8562-4086-4705-9056-9a9b58da79fd', 3), -- Petits filets Stroganoff <- Crème
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', '8421945f-5157-4b00-b190-bd36c3d67923', 4), -- Petits filets Stroganoff <- Moutarde
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', '2f229192-2b61-4efc-a284-9335558c00d2', 5), -- Petits filets Stroganoff <- Paprika
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', 'e1c76463-e487-4400-b8d6-c34b91588d97', 6), -- Petits filets Stroganoff <- Cornichon
  ('17234def-c98a-4ba8-b1c6-36c8f85f3a42', '391cd541-bc4a-4667-825c-3da62ae8508c', 7), -- Petits filets Stroganoff <- Riz
  ('ec6b6b59-858c-4fb2-ac3b-628895c6b883', 'b1b29163-31ac-4ed8-bf32-203c9d8ae10b', 1), -- Steak au poivre <- Bœuf
  ('ec6b6b59-858c-4fb2-ac3b-628895c6b883', 'd5ab346d-fa8e-4644-a53c-79104dd04da3', 2), -- Steak au poivre <- Poivre
  ('ec6b6b59-858c-4fb2-ac3b-628895c6b883', '4fffef9a-4bd9-4c14-b84d-2366a9fe8ae4', 3), -- Steak au poivre <- Cognac
  ('ec6b6b59-858c-4fb2-ac3b-628895c6b883', '9b8f8562-4086-4705-9056-9a9b58da79fd', 4), -- Steak au poivre <- Crème
  ('ec6b6b59-858c-4fb2-ac3b-628895c6b883', 'edf2b853-9094-4512-b20f-f5f28357037a', 5), -- Steak au poivre <- Beurre
  ('ec6b6b59-858c-4fb2-ac3b-628895c6b883', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 6), -- Steak au poivre <- Pomme de terre
  ('116960e1-dea1-4864-a2c4-599bc4856816', 'b1b29163-31ac-4ed8-bf32-203c9d8ae10b', 1), -- Estouffade de bœuf bourguignonne <- Bœuf
  ('116960e1-dea1-4864-a2c4-599bc4856816', 'fd34c4a5-8ace-432b-ab26-67f294b02dd1', 2), -- Estouffade de bœuf bourguignonne <- Vin rouge
  ('116960e1-dea1-4864-a2c4-599bc4856816', 'f35186e7-04fa-4e1e-a975-be7b127357ee', 3), -- Estouffade de bœuf bourguignonne <- Lardons
  ('116960e1-dea1-4864-a2c4-599bc4856816', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 4), -- Estouffade de bœuf bourguignonne <- Oignon
  ('116960e1-dea1-4864-a2c4-599bc4856816', 'd194a03a-ee4d-4efd-8e69-bf80176b258d', 5), -- Estouffade de bœuf bourguignonne <- Carotte
  ('116960e1-dea1-4864-a2c4-599bc4856816', '793d04ad-abc7-43e1-91dc-1eb4fdaee894', 6), -- Estouffade de bœuf bourguignonne <- Ail
  ('116960e1-dea1-4864-a2c4-599bc4856816', 'c349d8ef-0891-4dcc-aedd-9e5332804677', 7), -- Estouffade de bœuf bourguignonne <- Bouquet garni
  ('116960e1-dea1-4864-a2c4-599bc4856816', 'edf2b853-9094-4512-b20f-f5f28357037a', 8), -- Estouffade de bœuf bourguignonne <- Beurre
  ('116960e1-dea1-4864-a2c4-599bc4856816', '8703923a-01eb-4be7-8a24-81e76ab3ccfa', 9), -- Estouffade de bœuf bourguignonne <- Pâtes
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', 'b1b29163-31ac-4ed8-bf32-203c9d8ae10b', 1), -- Estouffade de bœuf provençale <- Bœuf
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', 'fd34c4a5-8ace-432b-ab26-67f294b02dd1', 2), -- Estouffade de bœuf provençale <- Vin rouge
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', '57a9dad2-3834-46c3-9049-06984f79ccbe', 3), -- Estouffade de bœuf provençale <- Tomate
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', '146043ea-6453-46a4-865f-efa3d3759e98', 4), -- Estouffade de bœuf provençale <- Olive
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', '793d04ad-abc7-43e1-91dc-1eb4fdaee894', 5), -- Estouffade de bœuf provençale <- Ail
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 6), -- Estouffade de bœuf provençale <- Oignon
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', 'b0736f02-89ca-40be-803e-a6050a4e17ea', 7), -- Estouffade de bœuf provençale <- Herbes de Provence
  ('88bbd784-060c-4660-9ef9-c16b90da56e1', '11cf07fc-0500-404c-ae37-a7d46b9be803', 8), -- Estouffade de bœuf provençale <- Orange
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', 'b7b6cee7-4bac-4933-98c5-6ea505207a93', 1), -- Navarin printanier <- Agneau
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', 'd194a03a-ee4d-4efd-8e69-bf80176b258d', 2), -- Navarin printanier <- Carotte
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', '8cfef6d9-e42b-4d93-a82d-bf509346d75c', 3), -- Navarin printanier <- Navet
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 4), -- Navarin printanier <- Pomme de terre
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', 'b7926c84-dc91-4c8b-a1ea-97812d6a3036', 5), -- Navarin printanier <- Petit pois
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 6), -- Navarin printanier <- Oignon
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', '57a9dad2-3834-46c3-9049-06984f79ccbe', 7), -- Navarin printanier <- Tomate
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', '793d04ad-abc7-43e1-91dc-1eb4fdaee894', 8), -- Navarin printanier <- Ail
  ('e48fd1df-943f-4e1c-9577-ea8ae4932d94', 'c349d8ef-0891-4dcc-aedd-9e5332804677', 9), -- Navarin printanier <- Bouquet garni
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', '023b0620-d770-40fb-8f96-40a777835925', 1), -- Sauté de veau marengo <- Veau
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', '57a9dad2-3834-46c3-9049-06984f79ccbe', 2), -- Sauté de veau marengo <- Tomate
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 3), -- Sauté de veau marengo <- Oignon
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', '793d04ad-abc7-43e1-91dc-1eb4fdaee894', 4), -- Sauté de veau marengo <- Ail
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 5), -- Sauté de veau marengo <- Champignon de Paris
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', '6a8ff19f-0d0c-4030-bf2f-0c233b3d6c02', 6), -- Sauté de veau marengo <- Vin blanc
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', 'c349d8ef-0891-4dcc-aedd-9e5332804677', 7), -- Sauté de veau marengo <- Bouquet garni
  ('60fc8b47-8c56-4e6c-8271-ab53acfb12b8', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 8), -- Sauté de veau marengo <- Pomme de terre
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', '83bd307f-7544-4430-b1b1-7df73e297961', 1), -- Poulet sauté chasseur <- Poulet
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 2), -- Poulet sauté chasseur <- Champignon de Paris
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', '37ea817e-d33c-4ef5-837b-ebff4b01c33b', 3), -- Poulet sauté chasseur <- Échalote
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', '57a9dad2-3834-46c3-9049-06984f79ccbe', 4), -- Poulet sauté chasseur <- Tomate
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', '6a8ff19f-0d0c-4030-bf2f-0c233b3d6c02', 5), -- Poulet sauté chasseur <- Vin blanc
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', 'c01d56f1-273e-4fbe-84e0-96bc0858987a', 6), -- Poulet sauté chasseur <- Estragon
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', 'edf2b853-9094-4512-b20f-f5f28357037a', 7), -- Poulet sauté chasseur <- Beurre
  ('b2b9caa6-198c-42f6-899a-4c0e22d9fd5f', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 8), -- Poulet sauté chasseur <- Pomme de terre
  ('234d9807-ec98-4750-b40f-d7e90fc8c097', '83bd307f-7544-4430-b1b1-7df73e297961', 1), -- Poulet cocotte grand-mère <- Poulet
  ('234d9807-ec98-4750-b40f-d7e90fc8c097', 'f35186e7-04fa-4e1e-a975-be7b127357ee', 2), -- Poulet cocotte grand-mère <- Lardons
  ('234d9807-ec98-4750-b40f-d7e90fc8c097', '7df4806f-63aa-4433-9fd3-abb1e1e05b6d', 3), -- Poulet cocotte grand-mère <- Pomme de terre
  ('234d9807-ec98-4750-b40f-d7e90fc8c097', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 4), -- Poulet cocotte grand-mère <- Oignon
  ('234d9807-ec98-4750-b40f-d7e90fc8c097', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 5), -- Poulet cocotte grand-mère <- Champignon de Paris
  ('234d9807-ec98-4750-b40f-d7e90fc8c097', 'edf2b853-9094-4512-b20f-f5f28357037a', 6), -- Poulet cocotte grand-mère <- Beurre
  ('66cdb100-4415-40b7-b581-170e79fc5c08', '83bd307f-7544-4430-b1b1-7df73e297961', 1), -- Fricassée de volaille à l'ancienne <- Poulet
  ('66cdb100-4415-40b7-b581-170e79fc5c08', 'd4985a06-2763-4a6a-8e68-f1e7f2d82a4e', 2), -- Fricassée de volaille à l'ancienne <- Champignon de Paris
  ('66cdb100-4415-40b7-b581-170e79fc5c08', '4a14984a-0ff0-40fa-9a5e-9475161d123f', 3), -- Fricassée de volaille à l'ancienne <- Oignon
  ('66cdb100-4415-40b7-b581-170e79fc5c08', '9b8f8562-4086-4705-9056-9a9b58da79fd', 4), -- Fricassée de volaille à l'ancienne <- Crème
  ('66cdb100-4415-40b7-b581-170e79fc5c08', 'fa316777-9af4-4615-b436-c5f5f1e55888', 5), -- Fricassée de volaille à l'ancienne <- Œuf
  ('66cdb100-4415-40b7-b581-170e79fc5c08', 'edf2b853-9094-4512-b20f-f5f28357037a', 6), -- Fricassée de volaille à l'ancienne <- Beurre
  ('66cdb100-4415-40b7-b581-170e79fc5c08', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 7), -- Fricassée de volaille à l'ancienne <- Farine
  ('66cdb100-4415-40b7-b581-170e79fc5c08', '391cd541-bc4a-4667-825c-3da62ae8508c', 8), -- Fricassée de volaille à l'ancienne <- Riz
  ('cecc1539-3394-44f0-a73a-7a65f47018ac', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 1), -- Crème renversée au caramel <- Lait
  ('cecc1539-3394-44f0-a73a-7a65f47018ac', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Crème renversée au caramel <- Œuf
  ('cecc1539-3394-44f0-a73a-7a65f47018ac', '6904cc20-88f5-415f-b00a-d08e9a057323', 3), -- Crème renversée au caramel <- Sucre
  ('cecc1539-3394-44f0-a73a-7a65f47018ac', '20c7e7be-65a3-4268-beff-4459f56e1c79', 4), -- Crème renversée au caramel <- Vanille
  ('35c2589e-0649-4515-91e2-b38c0989f6c4', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 1), -- Pot de crème <- Lait
  ('35c2589e-0649-4515-91e2-b38c0989f6c4', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Pot de crème <- Œuf
  ('35c2589e-0649-4515-91e2-b38c0989f6c4', '6904cc20-88f5-415f-b00a-d08e9a057323', 3), -- Pot de crème <- Sucre
  ('35c2589e-0649-4515-91e2-b38c0989f6c4', '32bf2c90-5e88-4654-bc2c-abb7b9277e97', 4), -- Pot de crème <- Café
  ('35c2589e-0649-4515-91e2-b38c0989f6c4', '20c7e7be-65a3-4268-beff-4459f56e1c79', 5), -- Pot de crème <- Vanille
  ('35c2589e-0649-4515-91e2-b38c0989f6c4', 'e2b135f8-f8a6-4151-9a00-99d22887a2aa', 6), -- Pot de crème <- Chocolat
  ('b5796803-6c9e-4d96-aff9-d33664d87155', 'e2b135f8-f8a6-4151-9a00-99d22887a2aa', 1), -- Mousse au chocolat <- Chocolat
  ('b5796803-6c9e-4d96-aff9-d33664d87155', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Mousse au chocolat <- Œuf
  ('b5796803-6c9e-4d96-aff9-d33664d87155', '6904cc20-88f5-415f-b00a-d08e9a057323', 3), -- Mousse au chocolat <- Sucre
  ('b5796803-6c9e-4d96-aff9-d33664d87155', 'edf2b853-9094-4512-b20f-f5f28357037a', 4), -- Mousse au chocolat <- Beurre
  ('cf08b700-6c8a-4cc2-937a-c2d44351409a', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 1), -- Œufs à la neige <- Lait
  ('cf08b700-6c8a-4cc2-937a-c2d44351409a', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Œufs à la neige <- Œuf
  ('cf08b700-6c8a-4cc2-937a-c2d44351409a', '6904cc20-88f5-415f-b00a-d08e9a057323', 3), -- Œufs à la neige <- Sucre
  ('cf08b700-6c8a-4cc2-937a-c2d44351409a', '20c7e7be-65a3-4268-beff-4459f56e1c79', 4), -- Œufs à la neige <- Vanille
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', '0819438a-30ab-4eb8-aa29-4c955531daf6', 1), -- Beignets de pommes <- Pomme
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 2), -- Beignets de pommes <- Farine
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', 'fa316777-9af4-4615-b436-c5f5f1e55888', 3), -- Beignets de pommes <- Œuf
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', '4038eb4b-7b21-47ef-9b3e-190a9f4d4e94', 4), -- Beignets de pommes <- Bière
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 5), -- Beignets de pommes <- Lait
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', '6904cc20-88f5-415f-b00a-d08e9a057323', 6), -- Beignets de pommes <- Sucre
  ('a00e73fa-7be6-4c6d-bac6-d9cfa7abebba', 'e0696740-2dfa-4ac3-a122-06dd1baa7ceb', 7), -- Beignets de pommes <- Huile
  ('789ebd6f-1d15-4eaa-9bbc-ebd13de9da3b', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 1), -- Crêpes au sucre <- Farine
  ('789ebd6f-1d15-4eaa-9bbc-ebd13de9da3b', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Crêpes au sucre <- Œuf
  ('789ebd6f-1d15-4eaa-9bbc-ebd13de9da3b', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 3), -- Crêpes au sucre <- Lait
  ('789ebd6f-1d15-4eaa-9bbc-ebd13de9da3b', 'edf2b853-9094-4512-b20f-f5f28357037a', 4), -- Crêpes au sucre <- Beurre
  ('789ebd6f-1d15-4eaa-9bbc-ebd13de9da3b', '6904cc20-88f5-415f-b00a-d08e9a057323', 5), -- Crêpes au sucre <- Sucre
  ('b818c178-ee9a-48f5-8a2c-eedf377bee26', 'edf2b853-9094-4512-b20f-f5f28357037a', 1), -- Choux chantilly <- Beurre
  ('b818c178-ee9a-48f5-8a2c-eedf377bee26', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 2), -- Choux chantilly <- Farine
  ('b818c178-ee9a-48f5-8a2c-eedf377bee26', 'fa316777-9af4-4615-b436-c5f5f1e55888', 3), -- Choux chantilly <- Œuf
  ('b818c178-ee9a-48f5-8a2c-eedf377bee26', '9b8f8562-4086-4705-9056-9a9b58da79fd', 4), -- Choux chantilly <- Crème
  ('c8a96111-83ef-4e8d-a08c-88eca79094a0', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 1), -- Choux à la crème et éclairs <- Lait
  ('c8a96111-83ef-4e8d-a08c-88eca79094a0', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Choux à la crème et éclairs <- Œuf
  ('c8a96111-83ef-4e8d-a08c-88eca79094a0', '6904cc20-88f5-415f-b00a-d08e9a057323', 3), -- Choux à la crème et éclairs <- Sucre
  ('c8a96111-83ef-4e8d-a08c-88eca79094a0', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 4), -- Choux à la crème et éclairs <- Farine
  ('c8a96111-83ef-4e8d-a08c-88eca79094a0', '32bf2c90-5e88-4654-bc2c-abb7b9277e97', 5), -- Choux à la crème et éclairs <- Café
  ('c8a96111-83ef-4e8d-a08c-88eca79094a0', 'e2b135f8-f8a6-4151-9a00-99d22887a2aa', 6), -- Choux à la crème et éclairs <- Chocolat
  ('92875de8-cee7-4dff-90d3-e99331c3d9fc', 'fa316777-9af4-4615-b436-c5f5f1e55888', 1), -- Génoise crème anglaise <- Œuf
  ('92875de8-cee7-4dff-90d3-e99331c3d9fc', '6904cc20-88f5-415f-b00a-d08e9a057323', 2), -- Génoise crème anglaise <- Sucre
  ('92875de8-cee7-4dff-90d3-e99331c3d9fc', '0e719f13-34e3-4b3e-8dee-44b7dcd237e7', 3), -- Génoise crème anglaise <- Farine
  ('92875de8-cee7-4dff-90d3-e99331c3d9fc', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 4), -- Génoise crème anglaise <- Lait
  ('92875de8-cee7-4dff-90d3-e99331c3d9fc', '20c7e7be-65a3-4268-beff-4459f56e1c79', 5), -- Génoise crème anglaise <- Vanille
  ('a46c3c3e-64e1-44da-8273-ce2cfdee07e7', 'edf2b853-9094-4512-b20f-f5f28357037a', 1), -- Moka <- Beurre
  ('a46c3c3e-64e1-44da-8273-ce2cfdee07e7', '6904cc20-88f5-415f-b00a-d08e9a057323', 2), -- Moka <- Sucre
  ('a46c3c3e-64e1-44da-8273-ce2cfdee07e7', 'fa316777-9af4-4615-b436-c5f5f1e55888', 3), -- Moka <- Œuf
  ('a46c3c3e-64e1-44da-8273-ce2cfdee07e7', '32bf2c90-5e88-4654-bc2c-abb7b9277e97', 4), -- Moka <- Café
  ('759d76c7-07c2-41d5-87ba-9f56328696f2', '9b8f8562-4086-4705-9056-9a9b58da79fd', 1), -- Mille-feuilles <- Crème
  ('17a9bf66-7322-4af0-88e2-ea9e627aa396', '0819438a-30ab-4eb8-aa29-4c955531daf6', 1), -- Tarte à l'alsacienne <- Pomme
  ('17a9bf66-7322-4af0-88e2-ea9e627aa396', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Tarte à l'alsacienne <- Œuf
  ('17a9bf66-7322-4af0-88e2-ea9e627aa396', '9b8f8562-4086-4705-9056-9a9b58da79fd', 3), -- Tarte à l'alsacienne <- Crème
  ('17a9bf66-7322-4af0-88e2-ea9e627aa396', '6904cc20-88f5-415f-b00a-d08e9a057323', 4), -- Tarte à l'alsacienne <- Sucre
  ('17a9bf66-7322-4af0-88e2-ea9e627aa396', 'f51272bc-e19e-4ef9-9828-977732fb5a37', 5), -- Tarte à l'alsacienne <- Prune
  ('d2bbadeb-c9cf-4005-bd31-af2307ab36d5', '9b8f8562-4086-4705-9056-9a9b58da79fd', 1), -- Tarte feuilletée aux fruits <- Crème
  ('dfb4caab-292a-4464-9608-7cf773b64184', '0819438a-30ab-4eb8-aa29-4c955531daf6', 1), -- Tarte aux pommes <- Pomme
  ('dfb4caab-292a-4464-9608-7cf773b64184', '6904cc20-88f5-415f-b00a-d08e9a057323', 2), -- Tarte aux pommes <- Sucre
  ('dfb4caab-292a-4464-9608-7cf773b64184', 'edf2b853-9094-4512-b20f-f5f28357037a', 3), -- Tarte aux pommes <- Beurre
  ('dfb4caab-292a-4464-9608-7cf773b64184', 'b9880863-bee6-448b-81ba-7756ab2aa935', 4), -- Tarte aux pommes <- Cannelle
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', 'edba5753-5591-487d-ab7b-5b0e8603f1e5', 1), -- Glace <- Lait
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', 'fa316777-9af4-4615-b436-c5f5f1e55888', 2), -- Glace <- Œuf
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', '6904cc20-88f5-415f-b00a-d08e9a057323', 3), -- Glace <- Sucre
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', '9b8f8562-4086-4705-9056-9a9b58da79fd', 4), -- Glace <- Crème
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', '20c7e7be-65a3-4268-beff-4459f56e1c79', 5), -- Glace <- Vanille
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', '32bf2c90-5e88-4654-bc2c-abb7b9277e97', 6), -- Glace <- Café
  ('f91d45fa-2898-4b2c-9bf9-bfddf491f023', 'e2b135f8-f8a6-4151-9a00-99d22887a2aa', 7), -- Glace <- Chocolat
  ('3546ab81-0925-4e60-a115-6a929c8f877e', '0819438a-30ab-4eb8-aa29-4c955531daf6', 1), -- Salade de fruits <- Pomme
  ('3546ab81-0925-4e60-a115-6a929c8f877e', 'ae6f79c0-e3e4-4e07-92a0-4f15c944a34f', 2), -- Salade de fruits <- Poire
  ('3546ab81-0925-4e60-a115-6a929c8f877e', '2ebdef76-210b-477a-814e-7baac68744f4', 3), -- Salade de fruits <- Banane
  ('3546ab81-0925-4e60-a115-6a929c8f877e', '11cf07fc-0500-404c-ae37-a7d46b9be803', 4), -- Salade de fruits <- Orange
  ('3546ab81-0925-4e60-a115-6a929c8f877e', '11188f42-b520-4155-8493-3228338466e4', 5), -- Salade de fruits <- Ananas
  ('3546ab81-0925-4e60-a115-6a929c8f877e', '555aefcf-c6e4-4f4a-99bd-a97bdd37a0b1', 6), -- Salade de fruits <- Fraise
  ('3546ab81-0925-4e60-a115-6a929c8f877e', '6904cc20-88f5-415f-b00a-d08e9a057323', 7), -- Salade de fruits <- Sucre
  ('3546ab81-0925-4e60-a115-6a929c8f877e', 'adeadcd9-b5ce-4fa5-b4f5-50f365f1e8ce', 8) -- Salade de fruits <- Citron
on conflict (recette_id, ingredient_id) do nothing;
