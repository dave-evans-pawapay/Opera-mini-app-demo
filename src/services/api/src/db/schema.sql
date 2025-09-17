create table if not exists merchants(
  id text primary key,
  name text not null,
  msisdn text,
  logo_url text,
  country text,
  settlement_pref text default 'stablecoin',
  created_at timestamp default now()
);

create table if not exists payments(
  id uuid default gen_random_uuid() primary key,
  merchant_id text not null,
  reference text not null,
  msisdn text not null,
  stablecoin text not null,
  local_amount numeric,
  local_currency text default 'RWF',
  stable_amount numeric not null,
  status text not null default 'submitted',
  tx_id text,
  rate numeric,
  fees numeric,
  created_at timestamp default now()
);

alter table if exists payments add column if not exists local_currency text default 'RWF';
