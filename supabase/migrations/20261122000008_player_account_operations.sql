create function public.reset_player_stats()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  delete from public.personal_bests where user_id = v_user_id;
end;
$$;

create function public.delete_player_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.reset_player_stats() from public, anon, authenticated;
revoke all on function public.delete_player_account() from public, anon, authenticated;
grant execute on function public.reset_player_stats() to authenticated;
grant execute on function public.delete_player_account() to authenticated;
