begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(24);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'player-a@example.test'),
  ('00000000-0000-0000-0000-000000000002', 'player-b@example.test');
insert into public.player_preferences (user_id, theme) values
  ('00000000-0000-0000-0000-000000000002', 'amber');
insert into public.personal_bests (user_id, game_id, score) values
  ('00000000-0000-0000-0000-000000000002', 'snake', 90);

set local role anon;
select throws_ok('select * from public.player_preferences', '42501', null, 'anonymous cannot read preferences');
select throws_ok('select * from public.personal_bests', '42501', null, 'anonymous cannot read bests');
select throws_ok($$select public.save_personal_best('snake', 10)$$, '42501', null, 'anonymous cannot save a best');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select is((select count(*) from public.player_preferences), 0::bigint, 'A cannot read B preferences');
select is((select count(*) from public.personal_bests), 0::bigint, 'A cannot read B bests');
select lives_ok($$update public.player_preferences set theme = 'mint' where user_id = '00000000-0000-0000-0000-000000000002'$$, 'A cannot update B preferences');
select throws_ok($$insert into public.player_preferences (user_id, theme) values ('00000000-0000-0000-0000-000000000002', 'mint')$$, '42501', null, 'A cannot insert B preferences');
select lives_ok($$insert into public.player_preferences (user_id, theme) values ('00000000-0000-0000-0000-000000000001', 'mint')$$, 'A can insert own preferences');
select throws_ok($$update public.player_preferences set user_id = '00000000-0000-0000-0000-000000000002' where user_id = '00000000-0000-0000-0000-000000000001'$$, '42501', null, 'A cannot transfer own preferences to B');
select throws_ok($$insert into public.personal_bests (user_id, game_id, score) values ('00000000-0000-0000-0000-000000000001', 'snake', 100)$$, '42501', null, 'direct best writes are denied');
select is(public.save_personal_best('snake', 50), 50, 'first best is stored');
select is(public.save_personal_best('snake', 10), 50, 'lower score does not replace best');
select is(public.save_personal_best('snake', 60), 60, 'higher score replaces best');
select is((select score from public.personal_bests where game_id = 'snake'), 60, 'RPC attributes write to A');
select is(public.save_personal_best('minesweeper', 12), 12, 'Minesweeper best is stored');
select is(public.save_personal_best('minesweeper', 5), 12, 'lower Minesweeper score does not replace best');
select is((select score from public.personal_bests where game_id = 'minesweeper'), 12, 'Minesweeper best is readable by its owner');
select is(public.save_personal_best('scorched-earth', 12), 12, 'Scorched Earth best is stored');
select is(public.save_personal_best('scorched-earth', 5), 12, 'lower Scorched Earth score does not replace best');
select is((select score from public.personal_bests where game_id = 'scorched-earth'), 12, 'Scorched Earth best is readable by its owner');
select throws_ok($$select public.save_personal_best('snake', -1)$$, '23514', null, 'negative score rejected');
select throws_ok($$select public.save_personal_best('unknown', 1)$$, '23514', null, 'unknown game rejected');
reset role;
select is((select score from public.personal_bests where user_id = '00000000-0000-0000-0000-000000000002' and game_id = 'snake'), 90, 'B best remains unchanged');

select is((select theme from public.player_preferences where user_id = '00000000-0000-0000-0000-000000000002'), 'amber', 'B preferences remain unchanged');

select * from finish();
rollback;
