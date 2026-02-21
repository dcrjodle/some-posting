create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',
  is_admin boolean default false
);

-- Set up Row Level Security (RLS)
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create table to store encrypted API keys
create table platform_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  platform text not null, -- 'x', 'linkedin', 'instagram', 'facebook', 'tiktok'
  access_token text not null,
  secret_token text, -- Some platforms need a secret, some don't
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, platform)
);

alter table platform_keys
  enable row level security;

create policy "Users can view own keys." on platform_keys
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert own keys." on platform_keys
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own keys." on platform_keys
  for update using ((select auth.uid()) = user_id);


-- Create table for Posts
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  hashtags text,
  media_url text, -- We can upload media to a Supabase bucket and store the public URL here
  platforms_posted_to text[] not null, -- Array of platforms
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts
  enable row level security;

create policy "Users can view own posts." on posts
  for select using ((select auth.uid()) = user_id);
  
create policy "Users can insert own posts." on posts
  for insert with check ((select auth.uid()) = user_id);
