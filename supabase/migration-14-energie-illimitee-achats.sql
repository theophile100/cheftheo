-- Chef Theo - migration 14 : a l'achat d'un produit payant, 30 jours
-- d'energie illimitee (cumulable si deja active), verifiee cote serveur.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

alter table public.profiles add column unlimited_energy_until timestamptz;

create or replace function public.start_lecon(p_lecon_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_unlimited_until timestamptz;
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

  select is_admin, unlimited_energy_until into v_is_admin, v_unlimited_until
  from public.profiles where id = v_user_id;

  if v_is_admin or (v_unlimited_until is not null and v_unlimited_until > now()) then
    -- Admin, ou periode d'energie illimitee achetee encore active : jamais
    -- bloque, energie jamais decomptee. Verifie ici cote serveur (colonnes
    -- non modifiables par le client), donc infalsifiable.
    return jsonb_build_object(
      'ok', true, 'already_completed', false,
      'energy', 25, 'energy_updated_at', now()
    );
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
  v_gained := floor(v_elapsed / 300)::int;

  if v_gained > 0 then
    v_new_energy := least(25, v_energy + v_gained);
    if v_new_energy >= 25 then
      v_new_updated_at := now();
    else
      v_new_updated_at := v_updated_at + (v_gained * interval '300 seconds');
    end if;
  else
    v_new_energy := v_energy;
    v_new_updated_at := v_updated_at;
  end if;

  if v_new_energy < 5 then
    update public.profiles set energy = v_new_energy, energy_updated_at = v_new_updated_at
    where id = v_user_id;

    v_available_at := v_new_updated_at + ((5 - v_new_energy) * interval '300 seconds');

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

-- Appelee uniquement par le webhook Chariow (cle service_role, jamais depuis
-- le navigateur) apres un paiement confirme : enregistre l'achat et
-- prolonge les 30 jours d'energie illimitee. Si une periode est deja en
-- cours, les 30 jours s'ajoutent au temps restant plutot que de repartir de
-- zero (cumul). Volontairement PAS de "grant execute ... to authenticated" :
-- seul le service_role (qui contourne les grants) peut l'appeler.
create or replace function public.record_produit_purchase(
  p_user_id uuid,
  p_produit_id uuid,
  p_chariow_reference text,
  p_buyer_email text,
  p_amount numeric,
  p_raw_payload jsonb
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_until timestamptz;
begin
  insert into public.achats
    (user_id, produit_id, chariow_reference, buyer_email, amount, raw_payload)
  values
    (p_user_id, p_produit_id, p_chariow_reference, p_buyer_email, p_amount, p_raw_payload);

  update public.profiles
  set
    energy = 25,
    unlimited_energy_until =
      greatest(now(), coalesce(unlimited_energy_until, now())) + interval '30 days'
  where id = p_user_id
  returning unlimited_energy_until into v_new_until;

  return v_new_until;
end;
$$;
