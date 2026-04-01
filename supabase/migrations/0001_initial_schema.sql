-- Golf Charity Subscription Platform
-- Step 5: Initial database schema for Supabase Postgres

create extension if not exists "pgcrypto";

-- ----------
-- Enums
-- ----------
create type public.subscription_status as enum ('active', 'inactive', 'lapsed', 'canceled');
create type public.draw_status as enum ('draft', 'published');
create type public.winner_status as enum ('pending', 'approved', 'paid', 'rejected');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.plan_type as enum ('monthly', 'yearly');

-- ----------
-- Charities
-- ----------
create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index charities_name_idx on public.charities (name);
create index charities_featured_idx on public.charities (featured);

-- ----------
-- Profiles (1:1 with auth.users)
-- ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  charity_id uuid references public.charities(id) on delete set null,
  charity_percentage numeric(5,2) not null default 10.00,
  subscription_status public.subscription_status not null default 'inactive',
  renewal_date date,
  created_at timestamptz not null default now(),
  constraint profiles_charity_percentage_min check (charity_percentage >= 10.00),
  constraint profiles_charity_percentage_max check (charity_percentage <= 100.00)
);

create index profiles_charity_id_idx on public.profiles (charity_id);
create index profiles_subscription_status_idx on public.profiles (subscription_status);

-- ----------
-- Subscriptions
-- ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_type public.plan_type not null,
  status public.subscription_status not null default 'inactive',
  renewal_date date not null,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_status_idx on public.subscriptions (status);

-- ----------
-- Scores
-- ----------
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null,
  date date not null,
  created_at timestamptz not null default now(),
  constraint scores_score_range check (score between 1 and 45)
);

create index scores_user_id_idx on public.scores (user_id);
create index scores_user_date_idx on public.scores (user_id, date desc);

-- ----------
-- Draws
-- ----------
create table public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_numbers integer[] not null,
  draw_date date not null,
  status public.draw_status not null default 'draft',
  jackpot_rollover boolean not null default false,
  created_at timestamptz not null default now(),
  constraint draws_numbers_length check (cardinality(draw_numbers) = 5),
  constraint draws_numbers_range check (
    draw_numbers <@ array[1,2,3,4,5,6,7,8,9,10,
                         11,12,13,14,15,16,17,18,19,20,
                         21,22,23,24,25,26,27,28,29,30,
                         31,32,33,34,35,36,37,38,39,40,
                         41,42,43,44,45]
  )
);

create unique index draws_draw_date_unique_idx on public.draws (draw_date);
create index draws_status_idx on public.draws (status);

-- ----------
-- Winners
-- ----------
create table public.winners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_count smallint not null,
  prize_amount numeric(12,2) not null default 0.00,
  status public.winner_status not null default 'pending',
  proof_url text,
  created_at timestamptz not null default now(),
  constraint winners_match_count check (match_count in (3,4,5)),
  constraint winners_prize_amount_non_negative check (prize_amount >= 0)
);

create index winners_user_id_idx on public.winners (user_id);
create index winners_draw_id_idx on public.winners (draw_id);
create index winners_status_idx on public.winners (status);

-- ----------
-- Payments
-- ----------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint payments_amount_non_negative check (amount >= 0)
);

create index payments_user_id_idx on public.payments (user_id);
create index payments_status_idx on public.payments (status);

-- ----------
-- Trigger: auto-create profile on signup
-- ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', 'New User')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ----------
-- Trigger: keep only latest 5 scores per user
-- ----------
create or replace function public.enforce_scores_limit()
returns trigger
language plpgsql
as $$
begin
  delete from public.scores s
  where s.user_id = new.user_id
    and s.id in (
      select id
      from public.scores
      where user_id = new.user_id
      order by date desc, created_at desc
      offset 5
    );

  return new;
end;
$$;

create trigger scores_limit_trigger
after insert on public.scores
for each row execute procedure public.enforce_scores_limit();
