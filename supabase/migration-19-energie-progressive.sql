-- Chef Theo - migration 19 : energie qui baisse question par question (au
-- lieu d'un forfait fixe au lancement de la lecon), avec bonus de serie et
-- porte de sortie (reviser une lecon deja reussie) quand la jauge est vide.
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

-- L'energie n'est plus un compte rond (un forfait de 5 par lecon) : elle
-- doit pouvoir descendre par demi-points.
alter table public.profiles alter column energy type numeric(4,1) using energy::numeric(4,1);
alter table public.profiles alter column energy set default 25;

-- Nombre de bonnes reponses d'affilee (toutes lecons confondues), remis a
-- zero des qu'une reponse est fausse. Sert au bonus "toutes les 4 bonnes
-- reponses".
alter table public.profiles add column correct_answer_streak integer not null default 0;

-- ============================================================
-- Toutes les valeurs du systeme d'energie, au meme endroit : modifier ici
-- (une nouvelle migration "create or replace") suffit a tout ajuster,
-- aucun autre code a toucher.
-- ============================================================

create or replace function public.energy_rules()
returns table (
  cost_per_answer numeric,
  cost_incorrect_extra numeric,
  streak_bonus_every int,
  streak_bonus_amount numeric,
  review_completion_bonus numeric,
  energy_max numeric,
  recharge_seconds int
)
language sql
immutable
as $$
  select
    0.5::numeric,   -- cout d'une reponse (juste ou fausse)
    1.0::numeric,   -- cout SUPPLEMENTAIRE si la reponse est fausse
    4,              -- une bonne reponse d'affilee sur N declenche le bonus
    2.0::numeric,   -- energie regagnee a chaque palier de bonnes reponses
    3.0::numeric,   -- energie regagnee en revisant une lecon deja reussie
    25.0::numeric,  -- energie maximale
    300;            -- secondes pour regagner 1 point avec le temps
$$;

-- ============================================================
-- Lancer une leçon : ne debite plus rien d'avance. Verifie juste qu'il
-- reste au moins un peu d'energie (sauf lecon deja reussie, ou admin/
-- periode illimitee, toujours autorises).
-- ============================================================

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
  v_rules record;
  v_energy numeric;
  v_updated_at timestamptz;
  v_elapsed numeric;
  v_gained numeric;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select is_admin, unlimited_energy_until into v_is_admin, v_unlimited_until
  from public.profiles where id = v_user_id;

  if v_is_admin or (v_unlimited_until is not null and v_unlimited_until > now()) then
    return jsonb_build_object(
      'ok', true, 'already_completed', false, 'energy', 25, 'energy_updated_at', now()
    );
  end if;

  select exists(
    select 1 from public.user_lecons where user_id = v_user_id and lecon_id = p_lecon_id
  ) into v_already;

  if v_already then
    select energy, energy_updated_at into v_energy, v_updated_at
    from public.profiles where id = v_user_id;
    return jsonb_build_object(
      'ok', true, 'already_completed', true, 'energy', v_energy, 'energy_updated_at', v_updated_at
    );
  end if;

  select * into v_rules from public.energy_rules();

  select energy, energy_updated_at into v_energy, v_updated_at
  from public.profiles where id = v_user_id
  for update;

  v_elapsed := extract(epoch from (now() - v_updated_at));
  v_gained := floor(v_elapsed / v_rules.recharge_seconds);
  if v_gained > 0 then
    v_energy := least(v_rules.energy_max, v_energy + v_gained);
    if v_energy >= v_rules.energy_max then
      v_updated_at := now();
    else
      v_updated_at := v_updated_at + (v_gained * (v_rules.recharge_seconds || ' seconds')::interval);
    end if;
    update public.profiles set energy = v_energy, energy_updated_at = v_updated_at
    where id = v_user_id;
  end if;

  if v_energy <= 0 then
    return jsonb_build_object(
      'ok', false, 'already_completed', false, 'energy', v_energy, 'energy_updated_at', v_updated_at
    );
  end if;

  return jsonb_build_object(
    'ok', true, 'already_completed', false, 'energy', v_energy, 'energy_updated_at', v_updated_at
  );
end;
$$;

-- ============================================================
-- Appelee apres CHAQUE reponse (juste ou fausse). Debite l'energie
-- progressivement, jamais en dessous de 0, jamais au milieu d'une lecon
-- deja terminee. Gere aussi le bonus de serie.
-- ============================================================

create or replace function public.record_answer(p_lecon_id uuid, p_is_correct boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_unlimited_until timestamptz;
  v_already_completed boolean;
  v_rules record;
  v_energy numeric;
  v_updated_at timestamptz;
  v_streak int;
  v_elapsed numeric;
  v_gained numeric;
  v_cost numeric;
  v_bonus numeric := 0;
  v_bonus_awarded boolean := false;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select is_admin, unlimited_energy_until into v_is_admin, v_unlimited_until
  from public.profiles where id = v_user_id;

  if v_is_admin or (v_unlimited_until is not null and v_unlimited_until > now()) then
    return jsonb_build_object(
      'energy', 25, 'energy_updated_at', now(), 'bonus_awarded', false, 'unlimited', true
    );
  end if;

  select * into v_rules from public.energy_rules();

  select exists(
    select 1 from public.user_lecons where user_id = v_user_id and lecon_id = p_lecon_id
  ) into v_already_completed;

  select energy, energy_updated_at, correct_answer_streak
    into v_energy, v_updated_at, v_streak
  from public.profiles where id = v_user_id
  for update;

  v_elapsed := extract(epoch from (now() - v_updated_at));
  v_gained := floor(v_elapsed / v_rules.recharge_seconds);
  if v_gained > 0 then
    v_energy := least(v_rules.energy_max, v_energy + v_gained);
    v_updated_at := v_updated_at + (v_gained * (v_rules.recharge_seconds || ' seconds')::interval);
  end if;

  if p_is_correct then
    v_streak := v_streak + 1;
    if v_streak % v_rules.streak_bonus_every = 0 then
      v_bonus := v_rules.streak_bonus_amount;
      v_bonus_awarded := true;
    end if;
  else
    v_streak := 0;
  end if;

  -- Reviser une lecon deja reussie ne coute jamais d'energie (c'est la
  -- porte de sortie quand la jauge est a zero).
  v_cost := case when v_already_completed then 0
                 else v_rules.cost_per_answer +
                      (case when p_is_correct then 0 else v_rules.cost_incorrect_extra end)
            end;

  v_energy := greatest(0, least(v_rules.energy_max, v_energy - v_cost + v_bonus));

  if v_energy >= v_rules.energy_max then
    v_updated_at := now();
  end if;

  update public.profiles
  set energy = v_energy, energy_updated_at = v_updated_at, correct_answer_streak = v_streak
  where id = v_user_id;

  return jsonb_build_object(
    'energy', v_energy,
    'energy_updated_at', v_updated_at,
    'bonus_awarded', v_bonus_awarded,
    'unlimited', false
  );
end;
$$;
grant execute on function public.record_answer(uuid, boolean) to authenticated;

-- ============================================================
-- Terminer une leçon : inchange pour une premiere reussite (XP + serie
-- quotidienne). Si la lecon etait DEJA reussie avant (revision), aucune
-- XP en plus, mais un petit bonus d'energie — la recompense de reviser.
-- ============================================================

create or replace function public.complete_lecon(p_lecon_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question_count int;
  v_xp_earned int;
  v_today date := current_date;
  v_new_streak int;
  v_profile public.profiles;
  v_inserted int;
  v_is_admin boolean;
  v_unlimited_until timestamptz;
  v_rules record;
  v_energy numeric;
  v_updated_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select count(*) into v_question_count from public.questions where lecon_id = p_lecon_id;
  v_xp_earned := v_question_count * 10;

  insert into public.user_lecons (user_id, lecon_id, xp_earned)
  values (v_user_id, p_lecon_id, v_xp_earned)
  on conflict (user_id, lecon_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    select is_admin, unlimited_energy_until into v_is_admin, v_unlimited_until
    from public.profiles where id = v_user_id;

    if not (v_is_admin or (v_unlimited_until is not null and v_unlimited_until > now())) then
      select * into v_rules from public.energy_rules();
      select energy, energy_updated_at into v_energy, v_updated_at
      from public.profiles where id = v_user_id
      for update;

      v_energy := least(v_rules.energy_max, v_energy + v_rules.review_completion_bonus);
      if v_energy >= v_rules.energy_max then
        v_updated_at := now();
      end if;

      update public.profiles set energy = v_energy, energy_updated_at = v_updated_at
      where id = v_user_id;
    end if;

    select * into v_profile from public.profiles where id = v_user_id;
    return v_profile;
  end if;

  select case
    when last_activity_date = v_today then current_streak
    when last_activity_date = v_today - 1 then current_streak + 1
    else 1
  end into v_new_streak
  from public.profiles where id = v_user_id;

  update public.profiles
  set xp_total = xp_total + v_xp_earned,
      current_streak = v_new_streak,
      longest_streak = greatest(longest_streak, v_new_streak),
      last_activity_date = v_today
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;
