-- Create provider verification table
create table if not exists public.provider_verification (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  badge_level text check (badge_level in ('bronze', 'silver', 'gold')),
  insurance_certificate_url text,
  background_check_completed boolean default false,
  verification_date timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(provider_id)
);

alter table public.provider_verification enable row level security;

-- RLS Policies
create policy "provider_verification_select_own"
  on public.provider_verification for select
  using (auth.uid() = provider_id);

create policy "provider_verification_select_public"
  on public.provider_verification for select
  using (verification_status = 'verified');

create policy "provider_verification_insert_own"
  on public.provider_verification for insert
  with check (auth.uid() = provider_id);

create policy "provider_verification_update_own"
  on public.provider_verification for update
  using (auth.uid() = provider_id);
