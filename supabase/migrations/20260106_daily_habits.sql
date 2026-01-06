-- Daily Habits Table Migration
-- Run this in Supabase SQL Editor

-- 1. Create daily_habits table
create table if not exists public.daily_habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title varchar(100) not null,
  description text,
  difficulty habit_difficulty default 'normal' not null,
  quest_date date default current_date not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.daily_habits enable row level security;

create policy "Users can manage own daily habits." 
  on public.daily_habits for all using (auth.uid() = user_id);

create index if not exists idx_daily_habits_user_date 
  on public.daily_habits(user_id, quest_date);

-- 2. Create daily_habit_logs table (separate from habit_logs due to FK constraint)
create table if not exists public.daily_habit_logs (
  id uuid default uuid_generate_v4() primary key,
  daily_habit_id uuid references public.daily_habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_date date default current_date not null,
  xp_earned int not null,
  gold_earned int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(daily_habit_id, completed_date)
);

alter table public.daily_habit_logs enable row level security;

create policy "Users can manage own daily habit logs." 
  on public.daily_habit_logs for all using (auth.uid() = user_id);
