-- Run this in Supabase SQL Editor

create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  avatar_url text,
  cook_whatsapp text,
  user_whatsapp text,
  allergens text[] default '{}',
  dietary_prefs text[] default '{}',
  disliked_ingredients text[] default '{}',
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

create table recipe_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  key_ingredient text not null,
  other_ingredients text[] default '{}',
  avoid_ingredients text[] default '{}',
  servings int not null default 2,
  created_at timestamptz default now()
);

create table recipes (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references recipe_sessions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  dish_name text not null,
  description text,
  calories_per_person int,
  cook_time_minutes int,
  difficulty text,
  uses_other_ingredients boolean default false,
  image_url text,
  ingredients jsonb default '[]',
  steps jsonb default '[]',
  selected boolean default false,
  created_at timestamptz default now()
);

create table never_show (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  dish_name text not null,
  created_at timestamptz default now(),
  unique(user_id, dish_name)
);

-- Enable RLS
alter table users enable row level security;
alter table recipe_sessions enable row level security;
alter table recipes enable row level security;
alter table never_show enable row level security;

-- Service role bypasses RLS, so our API routes (using service role key) work fine
-- No additional policies needed for server-side only access
