## Talent Tracker

Employees and job seekers can track their skills, knowledge, and job applications with an AI coach.

### Setup

1) Create a Supabase project and copy the Project URL and anon key

2) Configure environment variables

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY
```

3) Apply database schema (connect psql to your Supabase DB or run in SQL editor)

```sql
-- supabase/seed.sql
```

4) Run the app

```bash
npm run dev
```

Open http://localhost:3000. You'll be redirected to /login. Sign in with magic link, GitHub, or Google (enable providers in Supabase).

### Features

- Skills: add and list personal skills with optional level
- Jobs: track job applications and status like Huntr
- AI Coach: chat endpoint powered by OpenAI (set OPENAI_API_KEY)

### Notes

- Row Level Security is enabled; policies restrict access to your own rows.
- Triggers auto-attach `auth.uid()` as `user_id` on inserts.

