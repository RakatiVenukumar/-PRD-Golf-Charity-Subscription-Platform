-- Scalability foundations for multi-country growth, team/corporate accounts,
-- campaign activation, and mobile-friendly API evolution.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'account_type'
      and n.nspname = 'public'
  ) then
    create type public.account_type as enum ('individual', 'team', 'corporate');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'organization_member_role'
      and n.nspname = 'public'
  ) then
    create type public.organization_member_role as enum ('owner', 'admin', 'member');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'campaign_status'
      and n.nspname = 'public'
  ) then
    create type public.campaign_status as enum ('draft', 'scheduled', 'active', 'completed', 'archived');
  end if;
end $$;

create table if not exists public.countries (
  code char(2) primary key,
  name text not null,
  currency_code char(3) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.countries (code, name, currency_code, is_active)
values
  ('US', 'United States', 'USD', true),
  ('CA', 'Canada', 'CAD', true),
  ('GB', 'United Kingdom', 'GBP', true),
  ('AU', 'Australia', 'AUD', true),
  ('IN', 'India', 'INR', true)
on conflict (code) do update
set
  name = excluded.name,
  currency_code = excluded.currency_code,
  is_active = excluded.is_active;

alter table public.charities
  add column if not exists country_code char(2) not null default 'US';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'charities_country_code_fkey'
  ) then
    alter table public.charities
      add constraint charities_country_code_fkey
      foreign key (country_code) references public.countries(code);
  end if;
end $$;

alter table public.profiles
  add column if not exists country_code char(2) not null default 'US';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_country_code_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_country_code_fkey
      foreign key (country_code) references public.countries(code);
  end if;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_type public.account_type not null default 'team',
  country_code char(2) not null references public.countries(code),
  billing_email text,
  external_ref text unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_member_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table public.profiles
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  country_code char(2) not null references public.countries(code),
  starts_at timestamptz,
  ends_at timestamptz,
  status public.campaign_status not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint campaigns_dates_valid check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists charities_country_code_idx on public.charities (country_code);
create index if not exists profiles_country_code_idx on public.profiles (country_code);
create index if not exists profiles_organization_id_idx on public.profiles (organization_id);
create index if not exists organizations_account_type_idx on public.organizations (account_type);
create index if not exists organizations_country_code_idx on public.organizations (country_code);
create index if not exists organization_members_organization_id_idx on public.organization_members (organization_id);
create index if not exists organization_members_user_id_idx on public.organization_members (user_id);
create index if not exists campaigns_status_idx on public.campaigns (status);
create index if not exists campaigns_country_code_idx on public.campaigns (country_code);
create index if not exists campaigns_starts_at_idx on public.campaigns (starts_at);
