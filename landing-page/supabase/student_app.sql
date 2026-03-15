-- Student profiles
create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  phone text,
  college text,
  class_level text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Student wallets (balance stored in paise as integer)
create table if not exists public.student_wallets (
  id uuid primary key default gen_random_uuid(),
  student_email text not null unique,
  balance_paise bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_wallets_email_idx on public.student_wallets (student_email);

-- Wallet transaction ledger
create table if not exists public.student_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  type text not null, -- credit | debit
  source text, -- recharge | session | adjustment
  amount_paise bigint not null,
  reference_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists student_wallet_tx_email_idx on public.student_wallet_transactions (student_email);
create index if not exists student_wallet_tx_created_idx on public.student_wallet_transactions (created_at desc);
create unique index if not exists student_wallet_tx_reference_uniq on public.student_wallet_transactions (reference_id) where reference_id is not null;

-- Atomic wallet increment
create or replace function public.increment_student_wallet(p_email text, p_amount bigint)
returns void
language plpgsql
as $$
begin
  insert into public.student_wallets (student_email, balance_paise)
  values (p_email, p_amount)
  on conflict (student_email)
  do update set balance_paise = public.student_wallets.balance_paise + excluded.balance_paise,
                updated_at = now();
end;
$$;

-- Chats list
create table if not exists public.student_chats (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  mentor_email text not null,
  mentor_name text,
  mentor_avatar text,
  last_message text,
  unread_count int not null default 0,
  is_online boolean not null default false,
  chat_rate int,
  call_rate int,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists student_chats_student_idx on public.student_chats (student_email);
create index if not exists student_chats_mentor_idx on public.student_chats (mentor_email);

-- Chat messages
create table if not exists public.student_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.student_chats(id) on delete cascade,
  sender text not null, -- student | mentor | system
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists student_messages_chat_idx on public.student_messages (chat_id);

-- Student sessions (for billing)
create table if not exists public.student_sessions (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  mentor_email text not null,
  session_type text not null, -- chat | call | video
  rate_per_min_paise int not null,
  duration_seconds int not null default 0,
  amount_paise bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists student_sessions_student_idx on public.student_sessions (student_email);
create index if not exists student_sessions_mentor_idx on public.student_sessions (mentor_email);
