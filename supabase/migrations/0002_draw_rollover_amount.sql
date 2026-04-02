-- Add rollover amount tracking for monthly jackpot carry-over.
alter table public.draws
  add column if not exists rollover_amount numeric(12,2) not null default 0.00;

create index if not exists draws_draw_date_idx on public.draws (draw_date desc);
