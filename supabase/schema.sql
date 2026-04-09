-- Big Walnut Foodies — Database Schema
-- Run this in the Supabase SQL editor to set up a fresh database
-- Project: Big Walnut Foodies food truck booking system

-- ── TABLES ──────────────────────────────────────────────────

create table if not exists applications (
  id               uuid primary key default gen_random_uuid(),
  business_name    text not null,
  contact_name     text not null,
  email            text not null,
  phone            text not null,
  requested_date   date not null,
  cuisine          text not null,
  years_in_biz     text,
  menu_link        text,
  instagram        text,
  facebook         text,
  bio              text,
  references_text  text,
  logo_url         text,
  status           text not null default 'pending',
  submitted_at     timestamptz not null default now(),
  updated_at       timestamptz
);

-- Status values: pending | approved | declined | cancelled

create table if not exists event_dates (
  id          uuid primary key default gen_random_uuid(),
  date        date not null unique,
  capacity    int not null default 1,
  created_at  timestamptz not null default now()
);

create table if not exists config (
  key    text primary key,
  value  text not null
);

-- Seed default config
insert into config (key, value)
values ('event_location', '')
on conflict (key) do nothing;

-- ── RLS ─────────────────────────────────────────────────────

alter table applications enable row level security;
alter table event_dates  enable row level security;
alter table config       enable row level security;

-- Public can read event_dates (calendar view)
create policy "public read event_dates"
  on event_dates for select using (true);

-- Public can read config (location shown on public calendar)
create policy "public read config"
  on config for select using (true);

-- Public can insert applications (booking form)
create policy "public insert applications"
  on applications for insert with check (true);

-- Authenticated users (organisers) can read all applications
create policy "auth read applications"
  on applications for select using (auth.role() = 'authenticated');

-- Authenticated users can update applications (approve/decline/cancel)
create policy "auth update applications"
  on applications for update using (auth.role() = 'authenticated');

-- Authenticated users can manage event_dates
create policy "auth insert event_dates"
  on event_dates for insert with check (auth.role() = 'authenticated');

create policy "auth update event_dates"
  on event_dates for update using (auth.role() = 'authenticated');

create policy "auth delete event_dates"
  on event_dates for delete using (auth.role() = 'authenticated');

-- Authenticated users can manage config
create policy "auth update config"
  on config for update using (auth.role() = 'authenticated');

-- ── ORGANISER ACCOUNTS ───────────────────────────────────────
-- Create organiser accounts via Supabase Dashboard:
-- Authentication → Users → Add user
-- Add both Julie and her neighbour with email + password
-- No further setup needed — RLS handles access automatically

-- ── EDGE FUNCTIONS ───────────────────────────────────────────
-- Deploy the four notification functions via Supabase CLI:
--   supabase functions deploy notify-new-application
--   supabase functions deploy notify-approved
--   supabase functions deploy notify-declined
--   supabase functions deploy notify-cancelled
--
-- Set the RESEND_API_KEY secret in Supabase Dashboard:
--   Settings → Edge Functions → Add secret
--   Key: RESEND_API_KEY
--   Value: your Resend API key
