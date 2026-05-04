create unique index if not exists student_wallet_tx_topup_reference_id_uidx
on public.student_wallet_transactions (reference_id)
where type = 'topup'
  and source = 'razorpay'
  and reference_id is not null;

create or replace function public.credit_student_wallet_topup(
  p_student_email text,
  p_amount_paise bigint,
  p_reference_id text,
  p_description text default 'Wallet top-up',
  p_source text default 'razorpay',
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  already_processed boolean,
  balance_paise bigint,
  transaction_id uuid,
  transaction_balance_after_paise bigint
)
language plpgsql
security definer
as $$
declare
  v_existing_tx public.student_wallet_transactions%rowtype;
  v_new_balance bigint;
  v_new_tx public.student_wallet_transactions%rowtype;
begin
  select *
  into v_existing_tx
  from public.student_wallet_transactions
  where reference_id = p_reference_id
    and type = 'topup'
    and source = p_source;

  if found then
    return query
    select
      true,
      coalesce(w.balance_paise, v_existing_tx.balance_after_paise),
      v_existing_tx.id,
      v_existing_tx.balance_after_paise
    from public.student_wallets w
    where w.student_email = p_student_email;

    return;
  end if;

  insert into public.student_wallets (student_email, balance_paise)
  values (p_student_email, 0)
  on conflict (student_email) do nothing;

  update public.student_wallets
  set
    balance_paise = balance_paise + p_amount_paise,
    updated_at = now()
  where student_email = p_student_email
  returning public.student_wallets.balance_paise into v_new_balance;

  insert into public.student_wallet_transactions (
    student_email,
    type,
    source,
    amount_paise,
    reference_id,
    metadata,
    description,
    balance_after_paise
  )
  values (
    p_student_email,
    'topup',
    p_source,
    p_amount_paise,
    p_reference_id,
    p_metadata,
    p_description,
    v_new_balance
  )
  returning * into v_new_tx;

  return query
  select
    false,
    v_new_balance,
    v_new_tx.id,
    v_new_tx.balance_after_paise;

exception
  when unique_violation then
    select *
    into v_existing_tx
    from public.student_wallet_transactions
    where reference_id = p_reference_id
      and type = 'topup'
      and source = p_source;

    return query
    select
      true,
      coalesce(w.balance_paise, v_existing_tx.balance_after_paise),
      v_existing_tx.id,
      v_existing_tx.balance_after_paise
    from public.student_wallets w
    where w.student_email = p_student_email;
end;
$$;

select proname
from pg_proc
where proname = 'credit_student_wallet_topup';
