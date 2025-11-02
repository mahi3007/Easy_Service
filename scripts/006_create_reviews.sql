-- Create reviews and ratings table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  review_type text not null check (review_type in ('customer-to-provider', 'provider-to-customer')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

-- RLS Policies
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = reviewer_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);
