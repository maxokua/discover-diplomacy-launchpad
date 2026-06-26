create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  interest text,
  note text,
  created_at timestamptz not null default now()
);

create unique index waitlist_email_interest_uniq
  on public.waitlist (lower(email), coalesce(interest, ''));

grant insert on public.waitlist to anon, authenticated;
grant all on public.waitlist to service_role;

alter table public.waitlist enable row level security;

create policy "waitlist_insert_any"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);