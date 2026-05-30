# Big Walnut Foodies — Session Handover
# Date: May 27, 2026

---

## Project Status

Food truck booking platform for Julie Arens (Big Walnut Foodies, Sunbury OH).
Community site — no commercial revenue. Ian is the developer, Julie is the non-technical owner.

---

## Stack

- React + Vite + Tailwind
- Supabase (PostgreSQL + Auth + Edge Functions)
- Netlify (hosting — Julie's free account)
- Resend (email notifications via Supabase edge functions)
- GoDaddy (domain — managed by Ian)

---

## Hosting — Confirmed Working

- **Netlify:** https://bwfoodies.netlify.app — deployed and rendering correctly
- **GitHub repo:** https://github.com/howdoilearn/foodtruck — public repo, Julie owns
- **Auto-deploy:** Ian pushes to GitHub → Netlify auto-deploys (public repo, no contributor restrictions on Netlify free)
- **Domain:** bigwalnutfoodies.com — pending DNS switch from GoDaddy to Netlify nameservers (Ian to do)
- **Vercel:** old account, broken, to be deleted after domain is live on Netlify

---

## Supabase

- Project URL: https://chmgvzbihdgkjmkcckoh.supabase.co
- Anon key: sb_publishable_iM54987Ufml7DVYeeBRFWQ_n5t_J6sV
- Tables: applications, event_dates, config
- RLS: enabled on all tables with appropriate policies
- Edge functions: notify-new-application, notify-approved, notify-declined, notify-cancelled
- Explicit grants added to schema.sql (required before Oct 30 2026)

**Current issue:** Julie entered the anon key with a trailing `5` in Netlify env vars.
Fix: remove the `5` from `VITE_SUPABASE_ANON_KEY` in Netlify → Site configuration → Environment variables → redeploy.

---

## Netlify Env Vars (correct values)

```
VITE_SUPABASE_URL=https://chmgvzbihdgkjmkcckoh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_iM54987Ufml7DVYeeBRFWQ_n5t_J6sV
```

---

## Current Workflow (baseline — confirmed with Julie)

- Truck owner submits booking request via public form (no account, no login)
- Admin (Julie + co-organiser) reviews in dashboard, approves or declines
- Calendar updates to reflect approved bookings
- Truck owner receives email notification of outcome
- No truck owner accounts — no stored profiles, no passwords
- Each booking is independent — same truck books again by filling the form again
- Cancellation is manual — truck owner contacts Julie, Julie updates the system
- Only Julie and co-organiser have system access (Supabase Auth)

---

## Immediate Next Steps

1. Julie fixes anon key in Netlify (remove trailing `5`) and redeploys
2. Verify Supabase connection — organiser login works, calendar loads data
3. Julie adds bigwalnutfoodies.com in Netlify domain settings
4. Ian switches GoDaddy nameservers to Netlify
5. Verify live on bigwalnutfoodies.com
6. Delete Vercel project

---

## Next Feature — SMS Notifications (new session)

Julie wants SMS instead of/alongside email for booking notifications.

**Minimal changes required:**
- Add Twilio account (Julie or Ian)
- Add optional SMS field to booking form (phone field already exists in schema)
- Replace/supplement Resend edge functions with Twilio edge functions
- Notification flow: approval/decline/cancellation via SMS

**No workflow changes** — same booking process, just different communication channel.
Email infrastructure stays in place as fallback or removed per Julie's preference.

---

## Key Files

- `src/components/Hero.jsx` — landing page hero
- `src/components/BookingForm.jsx` — public booking form
- `src/components/Dashboard.jsx` — organiser dashboard
- `src/components/CalendarView.jsx` — public calendar
- `supabase/schema.sql` — full db schema + RLS + grants
- `supabase/functions/` — email edge functions (to be updated for SMS)
- `api/calendar.js` — ICS calendar feed (env vars, no hardcoded keys)
- `public/_redirects` — Netlify SPA routing fix
- `TRANSFER.md` — full handover reference doc

---

## Deployment Flow (for reference in new session)

```bash
# Make changes locally
npm run dev  # test locally

# Deploy
git add -A
git commit -m "your message"
git push  # Netlify auto-deploys
```

No deploy hook needed. No Julie involvement for deployments.
