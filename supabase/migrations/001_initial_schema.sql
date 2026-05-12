create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'athlete' check (role in ('coach', 'athlete')),
  created_at timestamptz not null default now()
);

create table if not exists public.athlete_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  date_of_birth date,
  weekly_km_goal numeric,
  notes text
);

create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  type text not null check (type in ('easy', 'tempo', 'intervals', 'long_run', 'rest')),
  title text not null,
  description text,
  planned_distance_km numeric,
  planned_duration_minutes integer,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  created_at timestamptz not null default now()
);

create table if not exists public.workout_results (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  actual_distance_km numeric,
  actual_duration_minutes integer,
  heart_rate_avg integer,
  notes text,
  completed_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    'athlete'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.athlete_profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_results enable row level security;
alter table public.messages enable row level security;

create policy "profiles_select_own_or_coach" on public.profiles
for select using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "profiles_update_own_or_coach" on public.profiles
for update using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "athlete_profiles_read_own_or_coach" on public.athlete_profiles
for select using (
  auth.uid() = id
  or auth.uid() = coach_id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "athlete_profiles_write_own_or_coach" on public.athlete_profiles
for all using (
  auth.uid() = id
  or auth.uid() = coach_id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
)
with check (
  auth.uid() = id
  or auth.uid() = coach_id
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "workouts_read_athlete_or_coach" on public.workouts
for select using (
  athlete_id = auth.uid()
  or coach_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "workouts_write_athlete_or_coach" on public.workouts
for all using (
  athlete_id = auth.uid()
  or coach_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
)
with check (
  athlete_id = auth.uid()
  or coach_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "results_read_athlete_or_coach" on public.workout_results
for select using (
  athlete_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "results_write_athlete_or_coach" on public.workout_results
for all using (
  athlete_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
)
with check (
  athlete_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "messages_read_sender_receiver_or_coach" on public.messages
for select using (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);

create policy "messages_insert_sender_only" on public.messages
for insert with check (
  sender_id = auth.uid()
);

create policy "messages_update_sender_receiver_or_coach" on public.messages
for update using (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'
  )
);
