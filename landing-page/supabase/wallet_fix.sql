-- Ensure wallet increment RPC exists
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

-- Backfill balances from transaction ledger
insert into public.student_wallets (student_email, balance_paise)
select student_email,
       sum(case when type = 'credit' then amount_paise else -amount_paise end)
from public.student_wallet_transactions
group by student_email
on conflict (student_email)
do update set balance_paise = excluded.balance_paise,
              updated_at = now();
