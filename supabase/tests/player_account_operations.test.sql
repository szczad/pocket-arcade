begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(19);

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'account-a@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'account-b@example.test');
insert into public.player_preferences (user_id, theme) values
  ('10000000-0000-0000-0000-000000000001', 'mint'),
  ('10000000-0000-0000-0000-000000000002', 'amber');
insert into public.personal_bests (user_id, game_id, score) values
  ('10000000-0000-0000-0000-000000000001', 'snake', 50),
  ('10000000-0000-0000-0000-000000000001', 'breakout', 30),
  ('10000000-0000-0000-0000-000000000002', 'snake', 90);

set local role anon;
select throws_ok('select public.reset_player_stats()', '42501', null, 'anonymous cannot reset stats');
select throws_ok('select public.delete_player_account()', '42501', null, 'anonymous cannot delete an account');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok('select public.reset_player_stats()', '28000', 'Authentication required', 'reset rejects a missing user ID');
select throws_ok('select public.delete_player_account()', '28000', 'Authentication required', 'deletion rejects a missing user ID');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select lives_ok('select public.reset_player_stats()', 'A can reset their stats');
select is((select count(*) from public.personal_bests), 0::bigint, 'reset removes all A bests');
select is((select theme from public.player_preferences), 'mint', 'reset preserves A preferences');
select lives_ok('select public.reset_player_stats()', 'reset is safe when there are no bests');
select is(public.save_personal_best('snake', 10), 10, 'A can save a new best after reset');

reset role;
select is((select count(*) from auth.users where id = '10000000-0000-0000-0000-000000000001'), 1::bigint, 'reset preserves A account');
select is((select score from public.personal_bests where user_id = '10000000-0000-0000-0000-000000000002' and game_id = 'snake'), 90, 'reset preserves B best');
select is((select theme from public.player_preferences where user_id = '10000000-0000-0000-0000-000000000002'), 'amber', 'reset preserves B preferences');

set local role authenticated;
select lives_ok('select public.delete_player_account()', 'A can delete their account');
reset role;
select is((select count(*) from auth.users where id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'A account is deleted');
select is((select count(*) from public.personal_bests where user_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'A bests cascade on account deletion');
select is((select count(*) from public.player_preferences where user_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'A preferences cascade on account deletion');
select is((select count(*) from auth.users where id = '10000000-0000-0000-0000-000000000002'), 1::bigint, 'B account is preserved');
select is((select score from public.personal_bests where user_id = '10000000-0000-0000-0000-000000000002' and game_id = 'snake'), 90, 'B best is preserved');
select is((select theme from public.player_preferences where user_id = '10000000-0000-0000-0000-000000000002'), 'amber', 'B preferences are preserved');

select * from finish();
rollback;
