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

-- Career paths
create table if not exists public.career_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_path_id uuid not null references public.career_paths(id) on delete cascade,
  title text not null,
  target_date date,
  completed boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Resources catalog and library
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  source text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, resource_id)
);

-- Learning plan (modules and items)
create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  title text not null,
  url text,
  completed boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.skills enable row level security;
alter table public.jobs enable row level security;
alter table public.career_paths enable row level security;
alter table public.milestones enable row level security;
alter table public.saved_resources enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_items enable row level security;

create policy "Users can manage their skills" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their jobs" on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their career paths" on public.career_paths
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their milestones" on public.milestones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their saved resources" on public.saved_resources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their learning modules" on public.learning_modules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their learning items" on public.learning_items
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

drop trigger if exists set_user_id_career_paths on public.career_paths;
create trigger set_user_id_career_paths before insert on public.career_paths
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_milestones on public.milestones;
create trigger set_user_id_milestones before insert on public.milestones
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_saved_resources on public.saved_resources;
create trigger set_user_id_saved_resources before insert on public.saved_resources
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_learning_modules on public.learning_modules;
create trigger set_user_id_learning_modules before insert on public.learning_modules
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_learning_items on public.learning_items;
create trigger set_user_id_learning_items before insert on public.learning_items
for each row execute function public.set_auth_user_id();

