# Pocket Arcade

A browser arcade with Snake, Breakout, Lane Dodger, Labyrinth, Frog Crossing, Tetris, Pac-Man and Asteroids. Play as a guest or sign in to keep personal bests and a theme across devices. Scores are client-reported personal records, not competitive rankings.

## Local development

Use Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Accounts are optional: without Supabase configuration, guest play remains available. Guest records and settings are stored on the device when browser storage is available; otherwise they last only for the current session. Account records are separate, and importing guest records requires explicit approval.
Choose English or Polish in Settings. The language is saved on the device when storage is available, otherwise for the current session.
Every game offers Slow, Medium, and Fast speeds in its Settings dialog; changes made during a run apply to the next run. Medium is the default. Personal bests are shared across speeds.
Press P or Escape during play to pause; use Resume to continue.
Labyrinth's square maze size can be set from 5 to 50, with a default of 10; changes apply to the next run. Completing a maze earns 1000 points minus the number of moves, with a minimum score of 1. Personal bests are shared across maze sizes, and a score of 1 earns the Maze Explorer achievement.
In Frog Crossing, avoid traffic and ride floating logs across the river to the far bank. Cars, road hazards and water end the run; reaching the opposite bank wins. Lanes nearer the river have denser traffic, buses, sewer work and stopped cars. Progress and crossing earn points. Choose 1–15 traffic lanes in Settings (default 5); changes apply to the next run. Personal bests are shared across lane counts, and a score of 1 earns the River Bound achievement.
In Tetris, move pieces left or right, rotate with Up, and soft drop with Down; touch controls are also available. Each cleared line earns 100 points, and stacking pieces to the top ends the run. A score of 100 earns the Line Builder achievement.
Lane Dodger awards achievements at 10, 50, 100, 200, 500 and 1000 vehicles passed. Tetris also awards achievements at 500, 5000, 20000 and 100000 points. Achievement progress is derived from each game's personal best and is shown in the player panel.
In Pac-Man, use the arrow keys or touch controls to navigate the maze, collect pellets and avoid ghosts. Power pellets let you eat ghosts temporarily. Collect every pellet to win; a score of 100 earns the Maze Muncher achievement.
In Asteroids, use Left and Right to rotate, Up to thrust, and hold Down to fire repeatedly; touch controls are also available. A score of 100 earns the Asteroid Breaker achievement.

To run the local account backend, install a Docker-compatible runtime and start the Supabase stack:

```sh
npx supabase start
npx supabase test db
```

Copy `.env.example` to `.env.local`, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the local API URL and publishable key printed by the CLI. Restart Vite after changing environment variables. Open the local email testing interface (the Inbucket/Mailpit URL printed by the CLI) to retrieve six-digit sign-in codes. The local Supabase configuration enables email signups and confirmation, and uses the templates in `supabase/templates/` for both first-time confirmation and subsequent sign-in.

For a production-like local build:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

## Hosted Supabase and Vercel

Provision or select an authorized Supabase project and Vercel project before deploying. The repository does not include credentials or a deployed URL.

1. In Supabase, enable email signups and email confirmation. Set the email OTP length to six digits. Configure both the **Confirm signup** and **Magic Link** email templates to display `{{ .Token }}` instead of a confirmation link; `supabase/templates/confirmation.html` and `supabase/templates/magic_link.html` provide the content. Configure production SMTP, appropriate email rate limits, and the HTTPS site URL for the intended deployment.
2. Authenticate the Supabase CLI, then apply the migration to the intended project:

   ```sh
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```

3. In the intended Vercel project and environment, set `VITE_SUPABASE_URL` to the project API URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its public publishable key. These values are embedded in the client build. Never put a service-role key, database credentials, SMTP credentials, or other secrets in Vite environment variables.
4. Link to the intended Vercel project and deploy:

   ```sh
   npx vercel link
   npx vercel --prod
   ```

`vercel.json` selects Vite, `npm ci`, `npm run build`, and `dist`. Game navigation uses URL hashes, so no server rewrite is required. Verify an actual sign-in email and game session on the resulting HTTPS deployment. For a mobile WebView, load that site as the main document with JavaScript and DOM storage enabled; no native bridge, popup, fullscreen, or orientation lock is required.

## Data and access

Authenticated players can read only their own preferences and bests. The database enforces theme, game and nonnegative score constraints, and accepts personal-best writes only through an authenticated RPC that retains the higher score atomically. Achievements are derived from personal bests. Deleting an account deletes its associated records. Guest records stay on the device until the player chooses to merge them; the account theme is never imported from guest settings.
