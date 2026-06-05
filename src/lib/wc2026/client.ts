const BASE_URL = 'https://api.wc2026api.com'

const headers = {
  'Authorization': `Bearer ${process.env.WC2026_API_KEY}`,
  'Content-Type': 'application/json'
}

export async function fetchAllMatches() {
  const res = await fetch(`${BASE_URL}/matches`, { headers })
  return res.json()
}

export async function fetchMatchesByStatus(status: 'scheduled' | 'live' | 'finished') {
  const res = await fetch(`${BASE_URL}/matches?status=${status}`, { headers })
  return res.json()
}

export async function fetchMatchById(matchId: number) {
  const res = await fetch(`${BASE_URL}/matches/${matchId}`, { headers })
  return res.json()
}
