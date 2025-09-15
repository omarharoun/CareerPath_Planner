-- Schemas: skills, jobs for talent tracker

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  level int check (level between 0 and 5),
  category text default 'general',
  target_level int check (target_level between 0 and 5),
  hours_practiced decimal(10,2) default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skill progress tracking
create table if not exists public.skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level_before int not null,
  level_after int not null,
  hours_added decimal(10,2) default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Learning recommendations
create table if not exists public.skill_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  recommendation_type text not null check (recommendation_type in ('course', 'practice', 'project', 'certification')),
  title text not null,
  description text,
  url text,
  priority int default 1 check (priority between 1 and 5),
  completed boolean default false,
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
  salary_range text,
  location text,
  remote_type text check (remote_type in ('remote', 'hybrid', 'onsite')),
  applied_date date,
  follow_up_date date,
  priority int default 1 check (priority between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Interview tracking
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  interview_type text not null check (interview_type in ('phone', 'video', 'onsite', 'technical', 'behavioral')),
  scheduled_date timestamptz,
  duration_minutes int,
  interviewer_name text,
  interviewer_role text,
  preparation_notes text,
  outcome_notes text,
  rating int check (rating between 1 and 5),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at timestamptz not null default now()
);

-- Follow-up tracking
create table if not exists public.job_follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  follow_up_type text not null check (follow_up_type in ('thank_you', 'status_check', 'additional_info', 'networking')),
  scheduled_date date not null,
  completed boolean default false,
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
alter table public.skill_progress enable row level security;
alter table public.skill_recommendations enable row level security;
alter table public.jobs enable row level security;
alter table public.interviews enable row level security;
alter table public.job_follow_ups enable row level security;
alter table public.career_paths enable row level security;
alter table public.milestones enable row level security;
alter table public.saved_resources enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_items enable row level security;

create policy "Users can manage their skills" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their skill progress" on public.skill_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their skill recommendations" on public.skill_recommendations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their jobs" on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their interviews" on public.interviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their job follow-ups" on public.job_follow_ups
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

drop trigger if exists set_user_id_skill_progress on public.skill_progress;
create trigger set_user_id_skill_progress before insert on public.skill_progress
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_skill_recommendations on public.skill_recommendations;
create trigger set_user_id_skill_recommendations before insert on public.skill_recommendations
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_interviews on public.interviews;
create trigger set_user_id_interviews before insert on public.interviews
for each row execute function public.set_auth_user_id();

drop trigger if exists set_user_id_job_follow_ups on public.job_follow_ups;
create trigger set_user_id_job_follow_ups before insert on public.job_follow_ups
for each row execute function public.set_auth_user_id();

-- Update timestamp triggers
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists update_skills_updated_at on public.skills;
create trigger update_skills_updated_at before update on public.skills
for each row execute function public.update_updated_at();

drop trigger if exists update_jobs_updated_at on public.jobs;
create trigger update_jobs_updated_at before update on public.jobs
for each row execute function public.update_updated_at();

