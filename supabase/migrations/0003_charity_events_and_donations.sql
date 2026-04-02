-- Charity enhancements: events, independent donations, signup charity metadata persistence

create table if not exists public.charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references public.charities(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  location text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists charity_events_charity_id_idx on public.charity_events (charity_id);
create index if not exists charity_events_event_date_idx on public.charity_events (event_date asc);

create table if not exists public.independent_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  charity_id uuid not null references public.charities(id) on delete cascade,
  amount numeric(12,2) not null,
  donor_name text,
  donor_email text,
  message text,
  created_at timestamptz not null default now(),
  constraint independent_donations_amount_positive check (amount > 0)
);

create index if not exists independent_donations_charity_id_idx on public.independent_donations (charity_id);
create index if not exists independent_donations_user_id_idx on public.independent_donations (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_charity_id uuid;
  metadata_charity_percentage numeric(5,2);
begin
  if coalesce(new.raw_user_meta_data ->> 'charity_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    metadata_charity_id := (new.raw_user_meta_data ->> 'charity_id')::uuid;
  else
    metadata_charity_id := null;
  end if;

  if coalesce(new.raw_user_meta_data ->> 'charity_percentage', '') ~ '^[0-9]+(\.[0-9]+)?$' then
    metadata_charity_percentage := least(100.00, greatest(10.00, (new.raw_user_meta_data ->> 'charity_percentage')::numeric));
  else
    metadata_charity_percentage := 10.00;
  end if;

  insert into public.profiles (id, email, name, charity_id, charity_percentage)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', 'New User'),
    metadata_charity_id,
    metadata_charity_percentage
  );

  return new;
end;
$$;
