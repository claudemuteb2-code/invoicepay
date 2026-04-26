-- Adds per-invoice template selection (Pro feature).
-- Idempotent: safe to run multiple times.
alter table public.invoices
  add column if not exists template text not null default 'classic';
