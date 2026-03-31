const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { businessName, email, contact, requestedDate, cuisine } = await req.json()
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
    const ORGANISER_EMAIL = 'ianflemingusa@gmail.com' // swap to Julie's email before launch

    const send = (to: string, subject: string, html: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'onboarding@resend.dev', to, subject, html }),
      })

    // Fire both emails — don't await sequentially, don't throw on failure
    await Promise.allSettled([
      send(
        ORGANISER_EMAIL,
        `New application: ${businessName}`,
        `<p>A new truck application has been submitted.</p>
         <ul>
           <li><strong>Business:</strong> ${businessName}</li>
           <li><strong>Cuisine:</strong> ${cuisine}</li>
           <li><strong>Requested date:</strong> ${requestedDate}</li>
           <li><strong>Contact:</strong> ${contact}</li>
           <li><strong>Email:</strong> ${email}</li>
         </ul>
         <p><a href="https://foodtruck-flax.vercel.app/dashboard">Open dashboard to review →</a></p>`,
      ),
      send(
        email,
        'We received your application — Big Walnut Foodies',
        `<p>Hi ${contact},</p>
         <p>Thanks for applying to Big Walnut Foodies! We've received your application for <strong>${requestedDate}</strong> and will be in touch within 24 hours.</p>
         <p>— Big Walnut Foodies</p>`,
      ),
    ])

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    // Never surface email errors to the caller
    console.error('notify-new-application error:', err)
    return new Response(JSON.stringify({ ok: false }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
