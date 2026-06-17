const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if(k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      select column_name, data_type, is_nullable, column_default 
      from information_schema.columns 
      where table_name = 'games' 
      order by ordinal_position;
    `
  });
  if (error) {
    console.error('Error with RPC, trying simple query if possible', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
