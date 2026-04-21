-- InvoicePay database schema
-- Run this in the Supabase SQL editor once per project.

-- =====================================================================
-- PROFILES
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  business_name text,
  paypal_email text,
  plan text not null default 'free', -- 'free' | 'pro'
  paypal_subscription_id text,
  subscription_status text, -- ACTIVE | CANCELLED | SUSPENDED | null
  subscription_current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- INVOICES
-- =====================================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  number text not null,
  status text not null default 'draft', -- draft | sent | paid
  client_name text not null,
  client_email text,
  currency text not null default 'USD',
  items jsonb not null default '[]'::jsonb, -- [{description, quantity, rate}]
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  due_date date,
  paid_at timestamptz,
  paypal_capture_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_public_token_idx on public.invoices(public_token);
create index if not exists invoices_created_at_idx on public.invoices(created_at desc);

alter table public.invoices enable row level security;

drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = user_id);

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own" on public.invoices
  for insert with check (auth.uid() = user_id);

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own" on public.invoices
  for update using (auth.uid() = user_id);

drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own" on public.invoices
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- WEBHOOK EVENTS (idempotency log)
-- =====================================================================
create table if not exists public.webhook_events (
  id text primary key, -- PayPal event id
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);
alter table public.webhook_events enable row level security;
-- No policies => only service role can read/write.
