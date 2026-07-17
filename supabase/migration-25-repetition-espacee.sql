-- Chef Theo - migration 25 : repetition espacee (type Anki/Duolingo).
-- Chaque question vue par un utilisateur est planifiee pour revenir a un
-- intervalle croissant (1j, 3j, 7j, 15j, 1 mois, 3 mois). Une bonne reponse
-- fait avancer d'un palier (intervalle plus long) ; une mauvaise reponse
-- fait reculer d'un palier (intervalle plus court, la question revient plus
-- vite).
-- A coller dans Supabase Dashboard > SQL Editor > New query, puis "Run".

create table public.question_reviews (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  level integer not null default 0,
  next_review_date date not null default current_date,
  last_reviewed_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.question_reviews enable row level security;

create policy "users select own question_reviews" on public.question_reviews
  for select to authenticated using (auth.uid() = user_id);

-- Pas de policy d'ecriture directe : toute mise a jour passe par
-- record_review() (SECURITY DEFINER), pour que le calcul du palier ne
-- puisse pas etre falsifie depuis le client.

-- ============================================================
-- Paliers d'intervalle, au meme endroit pour rester facile a ajuster
-- (une migration "create or replace" suffit).
-- ============================================================
create or replace function public.srs_intervals()
returns integer[]
language sql
immutable
as $$
  select array[1, 3, 7, 15, 30, 90]; -- jours : 1j, 3j, 7j, 15j, 1 mois, 3 mois
$$;

create or replace function public.record_review(p_question_id uuid, p_is_correct boolean)
returns public.question_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_intervals integer[] := public.srs_intervals();
  v_max_level integer := array_length(v_intervals, 1) - 1;
  v_level integer;
  v_row public.question_reviews;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select level into v_level from public.question_reviews
  where user_id = v_user_id and question_id = p_question_id;

  if v_level is null then
    v_level := 0;
  elsif p_is_correct then
    v_level := least(v_max_level, v_level + 1);
  else
    v_level := greatest(0, v_level - 1);
  end if;

  insert into public.question_reviews (user_id, question_id, level, next_review_date, last_reviewed_at)
  values (v_user_id, p_question_id, v_level, current_date + v_intervals[v_level + 1], now())
  on conflict (user_id, question_id)
  do update set level = excluded.level,
                next_review_date = excluded.next_review_date,
                last_reviewed_at = excluded.last_reviewed_at
  returning * into v_row;

  return v_row;
end;
$$;
grant execute on function public.record_review(uuid, boolean) to authenticated;
