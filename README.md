# Big Walnut Foodies — Food Truck Booking System

Live demo: https://jlxwzbrfbhoqymldinbv.supabase.co (see Julie for credentials)

React + Vite + Supabase. Deployed on Vercel.

## What it does

- Public calendar — truck owners view available dates and submit booking requests
- Booking form — business details, cuisine, contact, bio, social links
- Organiser dashboard — approve, decline, cancel applications with email notifications
- PDF snapshot export and phone number CSV export
- Two-organiser access via Supabase Auth

## Stack

- React 18 + Vite
- Supabase (database + auth + edge functions)
- Resend (transactional email via Supabase edge functions)
- Vercel (hosting + serverless API)

## Setup for a new developer

### 1. Clone and install
```bash
git clone <repo-url>
cd foodtruck
npm install
```

### 2. Create a Supabase project
- Create a new project at supabase.com
- Go to SQL Editor and run `supabase/schema.sql`
- Go to Authentication → Users → Add user for each organiser

### 3. Set up Resend
- Create account at resend.com
- Add and verify your sending domain
- Create an API key
- In Supabase Dashboard → Settings → Edge Functions → add secret:
  - `RESEND_API_KEY` = your Resend API key

### 4. Deploy edge functions
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy notify-new-application
npx supabase functions deploy notify-approved
npx supabase functions deploy notify-declined
npx supabase functions deploy notify-cancelled
```

### 5. Configure environment variables
Copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Deploy to Vercel
- Import the repo in Vercel
- Add the same two env vars in Vercel project settings
- Deploy

## Project structure

```
src/
  components/
    BookingForm.jsx       — public truck application form
    CalendarView.jsx      — public calendar
    CommunityCalendar.jsx — community-facing date display
    Dashboard.jsx         — organiser dashboard (auth required)
    Header.jsx / Footer.jsx / Hero.jsx
  lib/
    supabase.js           — Supabase client
api/
  calendar.js             — Vercel serverless function
supabase/
  schema.sql              — database schema and RLS policies
  functions/              — email notification edge functions
```
