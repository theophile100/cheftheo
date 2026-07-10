-- Chef Theo - migration 8 : systeme d'energie, table "produits" (remplace
-- "ebooks"), reclamation gratuite avec bonus d'energie, et preparation du
-- webhook Chariow.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- ============================================================
-- Énergie
-- ============================================================

alter table public.profiles add column energy integer not null default 25;
alter table public.profiles add column energy_updated_at timestamptz not null default now();

-- ============================================================
-- Produits (remplace la table "ebooks" - plus riche : filiere, gratuit/payant,
-- fichier ou lien pour le gratuit). L'ancienne table "ebooks" n'est PAS
-- supprimee (ses donnees sont copiees dans "produits" ci-dessous), vous
-- pouvez la supprimer vous-meme plus tard une fois que tout est verifie.
-- ============================================================

create table public.produits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  filiere_id uuid references public.filieres(id) on delete set null,
  type text not null check (type in ('gratuit', 'payant')),
  -- payant
  price numeric(10, 2),
  cta_type text check (cta_type in ('url', 'embed')),
  chariow_url text,
  chariow_embed_code text,
  -- gratuit
  free_type text check (free_type in ('file', 'link')),
  free_file_url text,
  free_link_url text,
  likes_enabled boolean not null default true,
  comments_enabled boolean not null default true,
  clicks integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.produits enable row level security;

create policy "produits readable by authenticated" on public.produits
  for select to authenticated using (true);

create or replace function public.increment_produit_click(p_produit_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.produits set clicks = clicks + 1 where id = p_produit_id;
end;
$$;
grant execute on function public.increment_produit_click(uuid) to authenticated;

-- Reprend le ou les ebooks déjà publiés dans la nouvelle table.
insert into public.produits (
  title, description, cover_url, type, price, cta_type, chariow_url,
  chariow_embed_code, likes_enabled, comments_enabled, clicks, position, created_at
)
select
  title, description, cover_url, 'payant', price, cta_type, chariow_url,
  chariow_embed_code, likes_enabled, comments_enabled, clicks, position, created_at
from public.ebooks;

-- ============================================================
-- Produits déjà obtenus (empêche de regagner de l'énergie en reprenant
-- plusieurs fois le même produit gratuit)
-- ============================================================

create table public.produits_obtenus (
  user_id uuid not null references public.profiles(id) on delete cascade,
  produit_id uuid not null references public.produits(id) on delete cascade,
  obtained_at timestamptz not null default now(),
  primary key (user_id, produit_id)
);

alter table public.produits_obtenus enable row level security;

create policy "users read own obtained produits" on public.produits_obtenus
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.claim_free_produit(p_produit_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_produit public.produits;
  v_inserted int;
  v_energy_added int := 0;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_produit from public.produits where id = p_produit_id;
  if not found or v_produit.type <> 'gratuit' then
    raise exception 'produit introuvable ou non gratuit';
  end if;

  insert into public.produits_obtenus (user_id, produit_id)
  values (v_user_id, p_produit_id)
  on conflict (user_id, produit_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    v_energy_added := 10;
    update public.profiles set energy = least(25, energy + 10) where id = v_user_id;
  end if;

  return jsonb_build_object(
    'energy_added', v_energy_added,
    'free_type', v_produit.free_type,
    'free_file_url', v_produit.free_file_url,
    'free_link_url', v_produit.free_link_url
  );
end;
$$;
grant execute on function public.claim_free_produit(uuid) to authenticated;

-- ============================================================
-- Lancer une leçon : vérifie/consomme l'énergie (5 points), sauf pour les
-- leçons déjà terminées (rejouer une leçon complétée reste gratuit).
-- Recharge de 1 point toutes les 12 minutes (720 secondes), jusqu'à 25.
-- ============================================================

create or replace function public.start_lecon(p_lecon_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_already boolean;
  v_energy int;
  v_updated_at timestamptz;
  v_elapsed numeric;
  v_gained int;
  v_new_energy int;
  v_new_updated_at timestamptz;
  v_available_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select exists(
    select 1 from public.user_lecons where user_id = v_user_id and lecon_id = p_lecon_id
  ) into v_already;

  if v_already then
    select energy, energy_updated_at into v_energy, v_updated_at
    from public.profiles where id = v_user_id;
    return jsonb_build_object(
      'ok', true, 'already_completed', true,
      'energy', v_energy, 'energy_updated_at', v_updated_at
    );
  end if;

  select energy, energy_updated_at into v_energy, v_updated_at
  from public.profiles where id = v_user_id
  for update;

  v_elapsed := extract(epoch from (now() - v_updated_at));
  v_gained := floor(v_elapsed / 720)::int;

  if v_gained > 0 then
    v_new_energy := least(25, v_energy + v_gained);
    if v_new_energy >= 25 then
      v_new_updated_at := now();
    else
      v_new_updated_at := v_updated_at + (v_gained * interval '720 seconds');
    end if;
  else
    v_new_energy := v_energy;
    v_new_updated_at := v_updated_at;
  end if;

  if v_new_energy < 5 then
    update public.profiles set energy = v_new_energy, energy_updated_at = v_new_updated_at
    where id = v_user_id;

    v_available_at := v_new_updated_at + ((5 - v_new_energy) * interval '720 seconds');

    return jsonb_build_object(
      'ok', false, 'already_completed', false,
      'energy', v_new_energy, 'energy_updated_at', v_new_updated_at,
      'available_at', v_available_at
    );
  end if;

  v_new_energy := v_new_energy - 5;
  update public.profiles set energy = v_new_energy, energy_updated_at = v_new_updated_at
  where id = v_user_id;

  return jsonb_build_object(
    'ok', true, 'already_completed', false,
    'energy', v_new_energy, 'energy_updated_at', v_new_updated_at
  );
end;
$$;
grant execute on function public.start_lecon(uuid) to authenticated;

-- ============================================================
-- Achats confirmés par le webhook Chariow (voir /api/chariow-webhook).
-- Écrit uniquement par le serveur (clé service_role), aucune policy
-- d'écriture nécessaire côté client.
-- ============================================================

create table public.achats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  produit_id uuid references public.produits(id) on delete set null,
  chariow_reference text,
  buyer_email text,
  amount numeric(10, 2),
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.achats enable row level security;
