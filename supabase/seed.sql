-- Schemas: skills, jobs for talent tracker

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  level int check (level between 0 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  status text not null check (status in ('saved','applied','interview','offer','rejected')),
  url text,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.skills enable row level security;
alter table public.jobs enable row level security;

create policy "Users can manage their skills" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their jobs" on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Triggers to set user_id from auth.uid() if not provided
create or replace function public.set_auth_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_user_id_skills on public.skills;
create trigger set_user_id_skills before insert on public.skills
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_jobs on public.jobs;
create trigger set_user_id_jobs before insert on public.jobs
for each row execute function public.set_auth_user_id();

