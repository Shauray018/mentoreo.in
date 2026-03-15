-- Student signups table
create table if not exists public.student_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  password text,
  created_at timestamptz not null default now()
);

create index if not exists student_signups_email_idx on public.student_signups (email);
create unique index if not exists student_signups_phone_uniq on public.student_signups (phone) where phone is not null;
