const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { businessName, email, contact, requestedDate } = await req.json()
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `You're confirmed for ${requestedDate} — Big Walnut Foodies`,
        html: `<p>Hi ${contact},</p>
               <p>Great news! <strong>${businessName}</strong> has been approved for <strong>${requestedDate}</strong> at Big Walnut Foodies.</p>
               <p>We'll be in touch with event details closer to the date.</p>
               <p>— Big Walnut Foodies</p>`,
      }),
    })

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('notify-approved error:', err)
    return new Response(JSON.stringify({ ok: false }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
