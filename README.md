## Talent Tracker (Next.js App Router template)

Modern Next.js 15 + React 19 app with App Router, Tailwind CSS v4, ESLint, and Supabase auth. Includes a marketing site, authenticated dashboard, and an AI coach endpoint.

### Quickstart

1) Copy envs

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY
```

2) Install and run

```bash
npm ci
npm run dev
```

3) Open `http://localhost:3000`

- Marketing home at `/`
- Open app at `/app` → redirects to `/dashboard` when signed in, or `/login`

### Project structure

```
src/app
  (marketing)/              # Marketing pages
    layout.tsx
    page.tsx
  (app)/dashboard/          # Authenticated app
    layout.tsx
    page.tsx
    skills/page.tsx
    jobs/page.tsx
    coach/page.tsx
  app/page.tsx              # Redirect helper to /dashboard or /login
  api/coach/route.ts        # AI coach endpoint (OpenAI)
  auth/callback/route.ts    # Supabase OAuth callback
  auth/signout/route.ts     # Signout
  error.tsx                 # Global error boundary
  not-found.tsx             # 404
```

### Supabase schema

Apply `supabase/seed.sql` via the SQL editor.

### Tech

- Next.js 15 (App Router), React 19
- Tailwind CSS v4
- Supabase Auth (SSR helpers)
- ESLint (flat) with `next/core-web-vitals`

