# Big Walnut Foodies — Handover Guide

---

## Overview

React + Vite + Supabase + Netlify + Resend.
Julie owns the GitHub repo and Netlify free account.
I am a GitHub contributor — my pushes auto-deploy via Netlify.

**Key decision:** The GitHub repo is public. Netlify's contributor restrictions
only apply to private repos. With a public repo, any contributor's push
auto-deploys on the Netlify free plan at no cost.

Env vars (Supabase keys) are stored in Netlify's dashboard — never in the repo.

---

## Deployment Flow

1. I push to GitHub (Julie's repo)
2. Netlify detects the push and auto-deploys
3. No manual steps needed from Julie

---

## Setup Steps (one-time, done on Zoom)

**Julie does:**

1. GitHub repo → Settings → Danger Zone → **Change visibility → Make public**

2. Go to **https://netlify.com** → Sign up with GitHub

3. Add new site → Import from Git → GitHub → select **foodtruck** repo

4. Build settings:

| Field | Value |
|---|---|
| Branch to deploy | main |
| Base directory | Leave as default |
| Build command | npm run build |
| Publish directory | dist |
| Functions directory | Leave as default |

5. Add environment variables:

| Key | Value |
|---|---|
| VITE_SUPABASE_URL | https://chmgvzbihdgkjmkcckoh.supabase.co |
| VITE_SUPABASE_ANON_KEY | sb_publishable_iM54987Ufml7DVYeeBRFWQ_n5t_J6sV |

6. Click **Deploy** — wait for green Published status

7. Send me the Netlify URL (e.g. https://bigwalnutfoodies.netlify.app)

**I then handle:**
- Verify the site is working on the Netlify URL
- Add bigwalnutfoodies.com domain in Netlify
- Update GoDaddy nameservers to Netlify's
- All future deployments via git push

---

## Environment Variables

Stored in Netlify dashboard — Site → Site configuration → Environment variables.
Never committed to the repo. New developers get values from me directly.
For local development copy `.env.example` to `.env.local` and fill in real values.

---

## GitHub Repo

- Owner: Julie (howdoilearn)
- Visibility: Public
- My role: Contributor
- URL: https://github.com/howdoilearn/foodtruck

---

## Netlify

- Account: Julie's free account
- Domain: bigwalnutfoodies.com
- DNS: Netlify DNS (nameservers updated in GoDaddy)
- Auto-deploy: on push to main from any contributor

---

## Supabase

- Project URL: https://chmgvzbihdgkjmkcckoh.supabase.co
- Auth: two organiser accounts — Supabase Dashboard → Authentication → Users
- Tables: applications, event_dates, config
- Storage: logos bucket

---

## Resend (email notifications)

Edge functions deployed to Supabase:
- notify-new-application
- notify-approved
- notify-declined
- notify-cancelled

API key stored as Supabase edge function secret: RESEND_API_KEY

---

## Domain

- bigwalnutfoodies.com
- Registered and managed by me at GoDaddy
- DNS: Netlify nameservers

---

## Local Development

```bash
git clone https://github.com/howdoilearn/foodtruck
cd foodtruck
npm install
cp .env.example .env.local
# fill in real values in .env.local
npm run dev
```
