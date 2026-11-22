create table public.player_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'midnight' check (theme in ('midnight', 'amber', 'mint'))
);

create table public.personal_bests (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null check (game_id in ('snake', 'breakout', 'lane-dodger')),
  score integer not null check (score >= 0),
  primary key (user_id, game_id)
);

alter table public.player_preferences enable row level security;
alter table public.personal_bests enable row level security;

revoke all on table public.player_preferences, public.personal_bests from public, anon, authenticated;
grant select, insert, update on public.player_preferences to authenticated;
grant select on public.personal_bests to authenticated;

create policy "Read own preferences" on public.player_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own preferences" on public.player_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own preferences" on public.player_preferences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Read own bests" on public.personal_bests
  for select to authenticated using ((select auth.uid()) = user_id);

create function public.save_personal_best(p_game_id text, p_score integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_score integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  insert into public.personal_bests as existing (user_id, game_id, score)
  values (v_user_id, p_game_id, p_score)
  on conflict (user_id, game_id) do update
    set score = greatest(existing.score, excluded.score)
  returning score into v_score;

  return v_score;
end;
$$;

revoke all on function public.save_personal_best(text, integer) from public, anon, authenticated;
grant execute on function public.save_personal_best(text, integer) to authenticated;
