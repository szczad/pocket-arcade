# Pocket Arcade

A browser arcade with Snake, Breakout, Lane Dodger, Labyrinth, Frog Crossing, Tetris, Pac-Man, Asteroids, Minesweeper and Scorched Earth. Play as a guest or sign in to keep personal bests and a theme across devices. Scores are client-reported personal records, not competitive rankings.

## Local development

Use Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Accounts are optional: without Supabase configuration, guest play remains available. Guest records and settings are stored on the device when browser storage is available; otherwise they last only for the current session. Account records are separate, and importing guest records requires explicit approval.
Choose English or Polish in Settings. The language is saved on the device when storage is available, otherwise for the current session.
Action games offer Slow, Medium, and Fast speeds in their Settings dialog; changes made during a run apply to the next run. Medium is the default. Personal bests are shared across speeds.
Press P or Escape during play to pause; use Resume to continue.
Use Expand board to enlarge the game and move achievements and touch controls underneath; Smaller board restores the standard layout.
Labyrinth's square maze size can be set from 5 to 50, with a default of 10; changes apply to the next run. Completing a maze earns 1000 points minus the number of moves, with a minimum score of 1. Personal bests are shared across maze sizes, and a score of 1 earns the Maze Explorer achievement.
In Frog Crossing, avoid traffic and ride floating logs across the river to the far bank. Cars, road hazards and water end the run; reaching the opposite bank wins. Lanes nearer the river have denser traffic, buses, sewer work and stopped cars. Progress and crossing earn points. Choose 1–15 traffic lanes in Settings (default 5); changes apply to the next run. Personal bests are shared across lane counts, and a score of 1 earns the River Bound achievement.
In Tetris, move pieces left or right, rotate with Up, and soft drop with Down; touch controls are also available. Each cleared line earns 100 points, and stacking pieces to the top ends the run. A score of 100 earns the Line Builder achievement.
Lane Dodger awards achievements at 10, 50, 100, 200, 500 and 1000 vehicles passed. Tetris also awards achievements at 500, 5000, 20000 and 100000 points. Achievement progress is derived from each game's personal best and is shown in the player panel.
Open Account for records and the same achievement badges shown in each game. Reset stats clears the active player's bests and achievements after confirmation, while preserving their theme; guest reset affects only this device. Signed-in players can permanently delete their account and its records and preferences after confirmation. Guest data remains on the device.
In Pac-Man, use the arrow keys or touch controls to navigate the maze, collect pellets and avoid ghosts. Power pellets let you eat ghosts temporarily. Collect every pellet to win; a score of 100 earns the Maze Muncher achievement.
In Asteroids, use Left and Right to rotate, Up to thrust, and hold Down to fire repeatedly; touch controls are also available. A score of 100 earns the Asteroid Breaker achievement.
In Minesweeper, reveal all 85 safe squares on a 10×10 board with 15 mines; the first reveal is safe. Numbers count adjacent mines, and each revealed square scores one point. Click or tap to reveal; right-click or enable Flag mode to mark suspected mines. Flag mode supports touch screens.
In Scorched Earth, duel a computer-controlled tank on destructible terrain. Use Up/Down to adjust your angle, Left/Right to change power, and Space or Fire to shoot. The directional and Fire buttons also support touch. Account for the wind and protect your tank while damaging the opponent.

To run the local account backend, install a Docker-compatible runtime and start the Supabase stack:

```sh
npx supabase start
npx supabase test db
```

Copy `.env.example` to `.env.local`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the local API URL and publishable key printed by the CLI. Restart Vite after changing environment variables. Configure the Google provider in the local Supabase stack with a Google OAuth client and callback URL as described in the hosted setup below.

For a production-like local build:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

## Hosted Supabase and Vercel

Provision or select an authorized Supabase project and Vercel project before deploying. The repository does not include credentials or a deployed URL.

1. In Google Cloud, configure the OAuth consent screen and create a Web application OAuth client. Add the app's origin to its authorized JavaScript origins and add the Supabase callback URL shown in **Authentication → Providers → Google** to its authorized redirect URIs. Enable Google in Supabase and enter the client ID and secret there. Under **Authentication → URL Configuration**, set the Site URL to the deployed app URL and add that URL to Redirect URLs. For local development, configure `[auth.external.google]` in `supabase/config.toml` with the client ID and a secret sourced from an environment variable; the local callback is `http://127.0.0.1:55421/auth/v1/callback`. See the [Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
   Google may reject OAuth sign-in inside embedded WebViews; use a supported system browser for Google sign-in.
2. Authenticate the Supabase CLI, then apply the migration to the intended project:

   ```sh
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```

3. Connect the intended Supabase project using the Vercel Marketplace integration. The build reads its `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`). For local development, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` override those values. Only the URL and publishable key are embedded in the browser build; never expose secret keys, database credentials or SMTP credentials.
4. Import the GitHub repository into the intended Vercel project and select its production branch. Vercel's Git integration builds and deploys that branch on each push. Alternatively, link and deploy from the CLI:

   ```sh
   npx vercel link
   npx vercel --prod
   ```

Apply the Supabase migrations before deploying the frontend. Run `npm ci`, `npm run build`, and `npx supabase test db` locally to check changes before pushing.

`vercel.json` selects Vite, `npm ci`, `npm run build`, and `dist`. Game navigation uses URL hashes, so no server rewrite is required. Verify an actual sign-in email and game session on the resulting HTTPS deployment. For a mobile WebView, load that site as the main document with JavaScript and DOM storage enabled; no native bridge, popup, fullscreen, or orientation lock is required.

## Data and access

Authenticated players can read only their own preferences and bests. The database enforces theme, game and nonnegative score constraints, and accepts personal-best writes only through an authenticated RPC that retains the higher score atomically. Achievements are derived from personal bests. Deleting an account deletes its associated records. Guest records stay on the device until the player chooses to merge them; the account theme is never imported from guest settings.
