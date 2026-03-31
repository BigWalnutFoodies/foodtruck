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
        from: 'Big Walnut Foodies <noreply@mail.bigwalnutfoodies.com>',
        to: email,
        subject: 'Important update regarding your booking — Big Walnut Foodies',
        html: `<p>Hi ${contact},</p>
               <p>We're sorry to let you know that the booking for <strong>${businessName}</strong> on <strong>${requestedDate}</strong> has had to be cancelled due to circumstances outside our control.</p>
               <p>We apologise for the inconvenience and hope to have you at a future event — please feel free to apply again for upcoming dates.</p>
               <p>— Big Walnut Foodies</p>`,
      }),
    })

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('notify-cancelled error:', err)
    return new Response(JSON.stringify({ ok: false }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
