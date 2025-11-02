-- Create services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  service_name text not null,
  category text not null check (category in ('plumbing', 'electrical', 'cleaning', 'catering', 'photography', 'event-planning', 'landscaping', 'other')),
  service_type text not null check (service_type in ('lvhf', 'hvlf')),
  description text,
  hourly_rate numeric(10, 2),
  base_price numeric(10, 2),
  availability_status text default 'available' check (availability_status in ('available', 'unavailable')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.services enable row level security;

-- RLS Policies
create policy "services_select_all"
  on public.services for select
  using (true);

create policy "services_insert_own"
  on public.services for insert
  with check (auth.uid() = provider_id);

create policy "services_update_own"
  on public.services for update
  using (auth.uid() = provider_id);

create policy "services_delete_own"
  on public.services for delete
  using (auth.uid() = provider_id);
