-- ─────────────────────────────────────────────────────────────────────────
-- perk. database schema (Neon Postgres)
-- Run this in the Neon SQL editor or via psql
-- ─────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Companies ─────────────────────────────────────────────────────────────
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  admin_email text not null unique,
  admin_password_hash text not null,
  brand_color text default '#5C6B2E',
  logo_url text,
  account_balance numeric(10,2) default 0,
  -- Stripe
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_treasury_account_id text unique,
  -- Billing
  plan text default 'starter' check (plan in ('starter','growth','scale')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Members ───────────────────────────────────────────────────────────────
create table members (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  email text not null,
  password_hash text,
  employment_type text default 'W-2' check (employment_type in ('W-2', '1099')),
  stipend_amount numeric(10,2) default 0,
  stipend_frequency text default 'monthly' check (stipend_frequency in ('monthly','quarterly')),
  balance numeric(10,2) default 0,
  card_limit numeric(10,2) default 0,
  categories text[] default '{}',
  -- Stripe Issuing
  stripe_cardholder_id text unique,
  stripe_card_id text unique,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, email)
);

-- ── Perks ─────────────────────────────────────────────────────────────────
create table perks (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  icon_id text default 'heart',
  title text not null,
  description text,
  company_paid boolean default false,
  cost_per_person numeric(10,2),
  frequency text check (frequency in ('monthly','quarterly')),
  taxable boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- ── Transactions ──────────────────────────────────────────────────────────
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  amount numeric(10,2) not null,
  merchant text not null,
  category text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  rejection_note text,
  -- Stripe
  stripe_authorization_id text unique,
  stripe_transaction_id text unique,
  transaction_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Invitations ───────────────────────────────────────────────────────────
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  email text not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- ── Helper functions ──────────────────────────────────────────────────────

-- Auto-update updated_at timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_updated_at before update on companies
  for each row execute function update_updated_at();
create trigger members_updated_at before update on members
  for each row execute function update_updated_at();
create trigger transactions_updated_at before update on transactions
  for each row execute function update_updated_at();

-- Get member's annual taxable perks total
create or replace function get_annual_taxable_perks(p_company_id uuid)
returns numeric as $$
  select coalesce(sum(
    case when frequency = 'monthly' then cost_per_person * 12
         else cost_per_person * 4
    end
  ), 0)
  from perks
  where company_id = p_company_id
    and company_paid = true
    and taxable = true
    and cost_per_person is not null;
$$ language sql stable;

-- ── Indexes ───────────────────────────────────────────────────────────────
create index on members(company_id);
create index on members(email);
create index on transactions(company_id);
create index on transactions(member_id);
create index on transactions(status);
create index on perks(company_id);
create index on invitations(token);
create index on invitations(email);
