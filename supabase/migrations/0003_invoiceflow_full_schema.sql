-- =====================================================================
-- InvoiceFlow full schema migration (DESTRUCTIVE)
-- ---------------------------------------------------------------------
-- This migration WIPES the legacy InvoicePay tables and rebuilds the
-- full InvoiceFlow schema (clients, invoices, estimates, recurring,
-- payments, team_members, audit_log, webhook_events).
--
-- The user explicitly asked to wipe existing invoice data when scaling
-- up. Run this in the Supabase SQL editor once. It is safe to run
-- multiple times — every CREATE is idempotent and the DROPs use IF
-- EXISTS.
-- =====================================================================

-- 1. Drop legacy invoice rows (the schema columns differ enough that
--    we cannot ALTER in place safely).
drop table if exists public.invoices cascade;
drop table if exists public.webhook_events cascade;

-- 2. Drop / re-create profiles trigger so we can extend the function.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Extend profiles with the new InvoiceFlow columns. We keep existing
--    rows (so users stay signed up) but reset every plan to 'free' so
--    nobody is silently grandfathered in.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists company_name text,
  add column if not exists logo_url text,
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists default_currency text not null default 'USD',
  add column if not exists default_tax_rate numeric(5,2) not null default 0,
  add column if not exists default_payment_terms text not null default 'net_30',
  add column if not exists invoice_prefix text not null default 'INV',
  add column if not exists invoice_footer text,
  add column if not exists reply_to_email text,
  add column if not exists email_signature text,
  add column if not exists paypal_plan_id text,
  add column if not exists onboarding_completed_at timestamptz;

-- Map any legacy 'pro' tier to 'pro' in the new four-tier model.
update public.profiles set plan = 'free'
  where plan not in ('free', 'starter', 'pro', 'business');

-- Drop legacy single column we replaced.
alter table public.profiles drop column if exists business_name;

-- 4. Re-add the auth -> profile trigger.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. CLIENTS
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  currency text not null default 'USD',
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_archived_idx on public.clients(user_id, archived);
alter table public.clients enable row level security;
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own" on public.clients for select using (auth.uid() = user_id);
drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own" on public.clients for insert with check (auth.uid() = user_id);
drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own" on public.clients for update using (auth.uid() = user_id);
drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own" on public.clients for delete using (auth.uid() = user_id);

-- 6. INVOICES (rebuilt from scratch)
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  public_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  number text not null,
  status text not null default 'draft',
  client_name text not null,
  client_email text,
  client_address text,
  currency text not null default 'USD',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  issue_date date not null default current_date,
  due_date date,
  payment_terms text not null default 'net_30',
  notes text,
  template text not null default 'classic',
  sent_at timestamptz,
  viewed_at timestamptz,
  paid_at timestamptz,
  paypal_capture_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_client_id_idx on public.invoices(client_id);
create index invoices_public_token_idx on public.invoices(public_token);
create index invoices_created_at_idx on public.invoices(created_at desc);
create index invoices_status_idx on public.invoices(user_id, status);
alter table public.invoices enable row level security;
create policy "invoices_select_own" on public.invoices for select using (auth.uid() = user_id);
create policy "invoices_insert_own" on public.invoices for insert with check (auth.uid() = user_id);
create policy "invoices_update_own" on public.invoices for update using (auth.uid() = user_id);
create policy "invoices_delete_own" on public.invoices for delete using (auth.uid() = user_id);

-- 7. ESTIMATES
create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  public_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  number text not null,
  status text not null default 'draft',
  client_name text not null,
  client_email text,
  client_address text,
  currency text not null default 'USD',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  issue_date date not null default current_date,
  expiry_date date,
  notes text,
  template text not null default 'classic',
  converted_invoice_id uuid references public.invoices(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists estimates_user_id_idx on public.estimates(user_id);
create index if not exists estimates_public_token_idx on public.estimates(public_token);
alter table public.estimates enable row level security;
drop policy if exists "estimates_select_own" on public.estimates;
create policy "estimates_select_own" on public.estimates for select using (auth.uid() = user_id);
drop policy if exists "estimates_insert_own" on public.estimates;
create policy "estimates_insert_own" on public.estimates for insert with check (auth.uid() = user_id);
drop policy if exists "estimates_update_own" on public.estimates;
create policy "estimates_update_own" on public.estimates for update using (auth.uid() = user_id);
drop policy if exists "estimates_delete_own" on public.estimates;
create policy "estimates_delete_own" on public.estimates for delete using (auth.uid() = user_id);

-- 8. RECURRING
create table if not exists public.recurring_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_invoice_id uuid not null references public.invoices(id) on delete cascade,
  frequency text not null,
  start_date date not null,
  end_date date,
  next_run_at timestamptz not null,
  auto_send boolean not null default false,
  active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recurring_user_id_idx on public.recurring_schedules(user_id);
create index if not exists recurring_next_run_idx on public.recurring_schedules(next_run_at) where active = true;
alter table public.recurring_schedules enable row level security;
drop policy if exists "recurring_select_own" on public.recurring_schedules;
create policy "recurring_select_own" on public.recurring_schedules for select using (auth.uid() = user_id);
drop policy if exists "recurring_insert_own" on public.recurring_schedules;
create policy "recurring_insert_own" on public.recurring_schedules for insert with check (auth.uid() = user_id);
drop policy if exists "recurring_update_own" on public.recurring_schedules;
create policy "recurring_update_own" on public.recurring_schedules for update using (auth.uid() = user_id);
drop policy if exists "recurring_delete_own" on public.recurring_schedules;
create policy "recurring_delete_own" on public.recurring_schedules for delete using (auth.uid() = user_id);

-- 9. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null,
  method text not null default 'paypal',
  paypal_transaction_id text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists payments_invoice_idx on public.payments(invoice_id);
create index if not exists payments_user_idx on public.payments(user_id);
alter table public.payments enable row level security;
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);

-- 10. TEAM MEMBERS
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  workspace_owner_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  invited_email text not null,
  role text not null default 'member',
  status text not null default 'pending',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists team_owner_idx on public.team_members(workspace_owner_id);
create index if not exists team_user_idx on public.team_members(user_id);
create unique index if not exists team_owner_email_uniq on public.team_members(workspace_owner_id, invited_email);
alter table public.team_members enable row level security;
drop policy if exists "team_select_self_or_owner" on public.team_members;
create policy "team_select_self_or_owner" on public.team_members
  for select using (auth.uid() = workspace_owner_id or auth.uid() = user_id);
drop policy if exists "team_insert_owner" on public.team_members;
create policy "team_insert_owner" on public.team_members
  for insert with check (auth.uid() = workspace_owner_id);
drop policy if exists "team_update_owner" on public.team_members;
create policy "team_update_owner" on public.team_members
  for update using (auth.uid() = workspace_owner_id);
drop policy if exists "team_delete_owner" on public.team_members;
create policy "team_delete_owner" on public.team_members
  for delete using (auth.uid() = workspace_owner_id);

-- 11. AUDIT LOG
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_user_idx on public.audit_log(user_id, created_at desc);
alter table public.audit_log enable row level security;
drop policy if exists "audit_select_own" on public.audit_log;
create policy "audit_select_own" on public.audit_log for select using (auth.uid() = user_id);

-- 12. WEBHOOK EVENTS
create table if not exists public.webhook_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);
alter table public.webhook_events enable row level security;

-- 13. Storage bucket for logos.
insert into storage.buckets (id, name, public)
  values ('logos', 'logos', true)
  on conflict (id) do nothing;

drop policy if exists "logos_read_public" on storage.objects;
create policy "logos_read_public" on storage.objects
  for select using (bucket_id = 'logos');

drop policy if exists "logos_insert_own" on storage.objects;
create policy "logos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "logos_update_own" on storage.objects;
create policy "logos_update_own" on storage.objects
  for update using (
    bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "logos_delete_own" on storage.objects;
create policy "logos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]
  );
