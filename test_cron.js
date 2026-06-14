const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = envLocal.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    acc[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const matches = await fetch("https://api.wc2026api.com/matches", {
    headers: { "Authorization": "Bearer wc26_PcpinQzLhoQ8GQ2v7Ckib9" }
  }).then(res => res.json());
  
  const m = matches.find(x => x.match_number === 2);
  
  const status =
    m.status === 'completed' || m.phase === 'FT' || m.phase === 'FT_PEN'
      ? 'finished'
      : ['1H', 'HT', '2H', 'ET1', 'ET2', 'PEN'].includes(m.phase)
      ? 'live'
      : 'scheduled';

  const { error } = await supabase.from('games').update({
    home_team: 'Coreia do Sul',
    away_team: 'República Tcheca',
    home_score: m.home_score ?? null,
    away_score: m.away_score ?? null,
    kickoff_at: m.date || m.kickoff_utc,
    status,
    group_stage: 'Grupo A',
    venue: m.stadium
  }).eq('api_football_id', m.id);

  if (error) {
    console.error(`ERRO no jogo ${m.id} (${m.home_team} x ${m.away_team}):`, JSON.stringify(error, null, 2));
  } else {
    console.log('UPDATE SUCCESS');
  }
}
run();
