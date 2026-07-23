-- Chef Theo - migration 29 : texte du bouton personnalisable sur une fiche
-- produit (Découvrir), pour pouvoir écrire "Regarder la vidéo" au lieu de
-- "Obtenir" quand le contenu est une vidéo.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.produits add column cta_label text;
