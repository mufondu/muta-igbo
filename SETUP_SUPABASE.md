# Supabase setup (parent sign-in, cloud sync, usage stats)

Until you add the two env vars below, the app runs exactly as before with no sign-in.

## 1. Create the project
1. Create a project at supabase.com (free tier is fine).
2. SQL editor: paste and run `supabase/schema.sql`.
3. Project settings > API: copy the **Project URL** and the **anon public key**.
   (Never put the `service_role` key in this app.)

## 2. Env vars
Create `.env.local` in the project root (already gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Restart `npx expo start --web` after changing it. On your host (Render, Netlify, etc.) set the same two variables **before** building, because Expo inlines them at build time.

## 3. Google sign-in
1. Google Cloud console > APIs & Services > Credentials > Create OAuth client ID > Web application.
2. Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Copy the client ID and secret into Supabase > Authentication > Providers > Google, and enable it.
4. Supabase > Authentication > URL Configuration: set **Site URL** to your live site, and add `http://localhost:8081` and your live URL to **Redirect URLs**.

## 4. Email and password
Supabase > Authentication > Providers > Email is on by default. Decide whether to keep "Confirm email" on (recommended: it proves the parent owns the address). Supabase uses **email**, not a free-form username, as the login name.

## 5. Install
```
npm install
```
(`@supabase/supabase-js` and `react-native-url-polyfill` are already in `package.json`.)

## 6. Reading your stats
Run in the Supabase SQL editor (it bypasses RLS, so only you see this):

```sql
-- Daily active parents and events
select date_trunc('day', created_at) as day, count(distinct user_id) as parents, count(*) as events
from usage_events group by 1 order by 1 desc;

-- Which features get used
select event, count(*) as n, count(distinct user_id) as parents
from usage_events where created_at > now() - interval '30 days'
group by 1 order by n desc;

-- Sign-ups over time
select date_trunc('day', created_at) as day, count(*) from auth.users group by 1 order by 1 desc;
```

## Events tracked
`sign_in` (method), `session_start`, `level_progress` (level id, percent), `quiz_best` (score), `activity_done`. No child names, ages or free text are ever sent. Add new events in `src/lib/analytics.ts` callers, never with personal data.

## Account deletion
`schema.sql` now defines `delete_my_account()`. If you ran the schema earlier, run the whole file again (it is safe to repeat) so the function exists. Without it, "Delete account" in the Parent Center shows an error.

## Known limits
- Sync is last-write-wins on the whole state document, using the device clock. Two devices used at the same moment can overwrite each other's latest changes.
- Google sign-in works on web. Native (iOS/Android) Google sign-in needs `expo-auth-session` and is not wired yet; native shows email/password only.
- Child first names are stored inside the parent's `app_state`. Encourage nicknames in the profile screen, and get the privacy policy reviewed (see COPPA note in `SAAS_MIGRATION_PLAN.md`).
