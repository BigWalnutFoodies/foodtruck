const SUPABASE_URL = 'https://jlxwzbrfbhoqymldinbv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ToRu54AXJUSUEGzgMa3inw_4Rjf6ftW'

function nextDayIso(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(y, m - 1, d + 1)
  return `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`
}

function escapeIcs(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/applications?status=eq.approved&select=requested_date,business_name,cuisine`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const apps = await response.json()

    const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Big Walnut Foodies//Pop-Up Schedule//EN',
      'X-WR-CALNAME:Big Walnut Foodies Pop-Up Schedule',
      'X-WR-CALDESC:Upcoming food truck pop-up events',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    for (const app of apps || []) {
      const dateCompact = app.requested_date.replace(/-/g, '')
      const uid = `${app.requested_date}-${app.business_name.toLowerCase().replace(/\s+/g, '-')}@bigwalnutfoodies.com`
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${dateCompact}`,
        `DTEND;VALUE=DATE:${nextDayIso(app.requested_date)}`,
        `SUMMARY:${escapeIcs(app.business_name + ' \u00b7 ' + app.cuisine)}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      )
    }

    lines.push('END:VCALENDAR')

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="bigwalnutfoodies.ics"')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(lines.join('\r\n'))
  } catch (err) {
    res.status(500).send('Error generating calendar feed')
  }
}
