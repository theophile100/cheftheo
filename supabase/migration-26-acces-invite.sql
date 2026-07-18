-- Chef Theo - migration 26 : acces invite (sans compte) pour parcourir les
-- filieres et l'arbre des lecons. Les requetes d'un visiteur non connecte
-- passent par le role "anon" de Supabase, distinct de "authenticated" --
-- les anciennes policies (filieres/lecons/unites readable by authenticated)
-- ne le couvraient pas, d'ou un 404 en pratique pour un invite. Le contenu
-- des questions reste reserve aux comptes connectes (mur affiche avant que
-- la lecon ne soit chargee, voir lecon/[id]/page.tsx).
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create policy "filieres readable by anon" on public.filieres
  for select to anon using (true);

create policy "lecons readable by anon" on public.lecons
  for select to anon using (true);

create policy "unites readable by anon" on public.unites
  for select to anon using (true);
