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
  const { data, error } = await supabase.from('games').upsert({
    api_football_id: 1,
    home_team: 'Coreia do Sul',
    away_team: 'República Tcheca',
    home_score: 2,
    away_score: 1,
    kickoff_at: '2026-06-12T02:00:00.000Z',
    status: 'finished',
    group_stage: 'Grupo A',
    venue: 'Estadio Akron'
  }, { 
    onConflict: 'api_football_id',
    ignoreDuplicates: false
  })
  
  if (error) {
    console.error('ERROR UPSERTING:', JSON.stringify(error, null, 2));
  } else {
    console.log('UPSERT SUCCESS', data);
  }
}
run();
