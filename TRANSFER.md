# Big Walnut Foodies — Transfer Guide

> Sequence matters — follow the steps in order.
> Julie's steps are marked [JULIE]. Ian's steps are marked [IAN].

---

## Vercel

**[JULIE] Step 1 — Create a Vercel Team**
- Log in to vercel.com
- Click the account selector (top-left) → Create Team
- Name it e.g. `BigWalnutFoodies`
- Keep the free plan

**[JULIE] Step 2 — Invite Ian as Owner**
- Team Settings → Members → Invite
- Email: ianflemingusa@gmail.com
- Role: Owner
- Send invite

**[IAN] Step 3 — Accept invite and transfer project**
- Accept the Vercel team invite (email link)
- Open the project (still under Ian's personal account)
- Settings → General → Transfer Project
- Select Julie's team from the dropdown → confirm
- Project moves to Julie's team, Ian stays as Owner

**[JULIE] Step 4 — Confirm**
- Log in to Vercel, switch to your team (top-left)
- You should see the project listed
- Settings → Environment Variables — confirm VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present

---

## Supabase

**[JULIE] Step 5 — Create a Supabase Organization**
- Log in to supabase.com
- Click the organization selector (top-right) → New organization
- Name it e.g. `BigWalnutFoodies`
- Keep the free plan

**[JULIE] Step 6 — Invite Ian as Owner**
- Organization Settings → Members → Invite member
- Email: ianflemingusa@gmail.com
- Role: Owner
- Send invite

**[IAN] Step 7 — Accept invite and transfer project**
- Accept the Supabase org invite (email link)
- Open the Supabase project (still under Ian's account)
- Project Settings → General → Transfer Project
- Select Julie's organization → confirm
- Project moves to Julie's org, Ian stays as Owner

**[JULIE] Step 8 — Confirm**
- Log in to Supabase, switch to your organization
- You should see the project
- Open Table Editor — confirm applications, event_dates, config tables are visible

---

## Domain (bigwalnutfoodies.com)

**[IAN] Step 9 — Initiate domain transfer**
- Unlock the domain at the registrar
- Send Julie the authorization/EPP code

**[JULIE] Step 10 — Accept domain transfer**
- Purchase transfer at your preferred registrar (e.g. Namecheap, GoDaddy)
- Enter the auth code when prompted
- Transfer takes 5–7 days to complete
- Reimburse Ian $20 for original registration fee

**[IAN] Step 11 — Update DNS if needed**
- Once transfer is complete, confirm DNS is still pointing to Vercel
- If not: add CNAME record pointing to cname.vercel-dns.com

---

## Resend (email notifications)

**[JULIE] Step 12 — Create a Resend account**
- Sign up at resend.com (free tier is sufficient)
- Add and verify your domain: bigwalnutfoodies.com
- Create an API key

**[JULIE] Step 13 — Add API key to Supabase**
- Supabase → Settings → Edge Functions → Secrets
- Add secret: RESEND_API_KEY = your key

**[IAN] Step 14 — Deploy edge functions**
- Run from terminal:
  ```
  npx supabase login
  npx supabase link --project-ref <project-ref>
  npx supabase functions deploy notify-new-application
  npx supabase functions deploy notify-approved
  npx supabase functions deploy notify-declined
  npx supabase functions deploy notify-cancelled
  ```

---

## Done

Once all steps are complete:
- Julie owns the Vercel team, Supabase org, domain, and Resend account
- Ian has Owner access to Vercel and Supabase for ongoing work
- All data is intact — no migration needed
- Ian can be removed from both platforms at any time via Members settings
