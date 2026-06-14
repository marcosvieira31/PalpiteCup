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
  const { error } = await supabase.from('games').update({
    home_score: 2,
    away_score: 1,
    status: 'live' // NOT finished
  }).eq('api_football_id', 1);

  if (error) {
    console.error(`ERRO:`, JSON.stringify(error, null, 2));
  } else {
    console.log('UPDATE SUCCESS WITH LIVE');
  }
}
run();
