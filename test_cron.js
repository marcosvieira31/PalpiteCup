const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const res = await fetch("https://api.wc2026api.com/matches", {
    headers: { Authorization: "Bearer wc26_PcpinQzLhoQ8GQ2v7Ckib9" }
  });
  const matches = await res.json();
  
  for (const m of matches) {
      const status =
        m.status === 'completed' || m.phase === 'FT' || m.phase === 'FT_PEN'
          ? 'finished'
          : ['1H', 'HT', '2H', 'ET1', 'ET2', 'PEN'].includes(m.phase)
          ? 'live'
          : 'scheduled'
          
      // console.log(m.id, status)
      
      const { error } = await supabase.from('games').upsert({
        api_football_id: m.id,
        home_score: m.home_score ?? null,
        away_score: m.away_score ?? null,
        kickoff_at: m.date || m.kickoff_utc,
        status,
      }, { onConflict: 'api_football_id' })
      if (error) {
        console.error(error);
      }
  }
  console.log("Done");
}

run().catch(console.error);
