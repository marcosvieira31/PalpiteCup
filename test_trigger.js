const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('query_db', { query: "SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgrelid = 'games'::regclass;" });
  if (error) {
     console.log('Cant run RPC:', error);
     
     // query pg directly if possible, wait I can just use psql? No psql.
     // I'll fetch it using postgrest directly if there's a view, but probably not.
  } else {
     console.log(data);
  }
}
run();
