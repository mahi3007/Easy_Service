-- Create payments table for escrow and transaction tracking
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'refunded', 'disputed')),
  stripe_payment_intent_id text,
  escrow_status text default 'held' check (escrow_status in ('held', 'released', 'refunded')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.payments enable row level security;

-- RLS Policies
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "payments_insert_customer"
  on public.payments for insert
  with check (auth.uid() = customer_id);

create policy "payments_update_own"
  on public.payments for update
  using (auth.uid() = customer_id or auth.uid() = provider_id);
