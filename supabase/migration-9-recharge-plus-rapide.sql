-- Chef Theo - migration 9 : recharge d'energie plus rapide (1 point toutes
-- les 5 minutes au lieu de 12). Recharge complete : environ 2h05 au lieu de 5h.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

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
