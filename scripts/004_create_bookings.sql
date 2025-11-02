-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  scheduled_date timestamp with time zone not null,
  duration_hours numeric(5, 2),
  total_price numeric(10, 2) not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.bookings enable row level security;

-- RLS Policies
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "bookings_insert_customer"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "bookings_delete_own"
  on public.bookings for delete
  using (auth.uid() = customer_id or auth.uid() = provider_id);
