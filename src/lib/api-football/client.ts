const BASE_URL = 'https://v3.football.api-sports.io'

const headers = {
  'x-apisports-key': process.env.API_FOOTBALL_KEY!,
  'Content-Type': 'application/json'
}

export async function fetchLiveGames() {
  const res = await fetch(`${BASE_URL}/fixtures?live=all&league=1&season=2026`, { headers })
  return res.json()
}

export async function fetchTodayGames() {
  const today = new Date().toISOString().split('T')[0]
  const res = await fetch(`${BASE_URL}/fixtures?date=${today}&league=1&season=2026`, { headers })
  return res.json()
}

export async function fetchFixture(fixtureId: number) {
  const res = await fetch(`${BASE_URL}/fixtures?id=${fixtureId}`, { headers })
  return res.json()
}
