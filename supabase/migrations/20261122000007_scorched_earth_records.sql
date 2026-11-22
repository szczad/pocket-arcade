alter table public.personal_bests
  drop constraint personal_bests_game_id_check;

alter table public.personal_bests
  add constraint personal_bests_game_id_check
  check (game_id in ('snake', 'breakout', 'lane-dodger', 'labyrinth', 'frog-crossing', 'tetris', 'pac-man', 'asteroids', 'minesweeper', 'scorched-earth'));
