-- Correctif : la fonction complete_lecon() avait une erreur de type
-- (comparaison booléen/nombre) qui empêchait la sauvegarde de l'XP et de la
-- progression. À coller dans Supabase Dashboard > SQL Editor > New query,
-- puis "Run". Sans risque : remplace uniquement la fonction, ne touche à
-- aucune donnée.

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
