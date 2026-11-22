# Pocket Arcade

A browser arcade with Snake, Breakout and Lane Dodger. Play as a guest or sign in to keep personal bests and a theme across devices. Scores are client-reported personal records, not competitive rankings.

## Local development

Use Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Accounts are optional: without Supabase configuration, guest play remains available. Guest records and settings are stored on the device when browser storage is available; otherwise they last only for the current session. Account records are separate, and importing guest records requires explicit approval.
Snake offers Slow, Medium, and Fast speeds; changes made during a run apply to the next run. Medium is the default. Personal bests are shared across speeds.

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
