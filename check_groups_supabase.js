const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = envLocal.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    acc[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('group_predictions')
    .select('user_id, group_name, position, predicted_team')
    .or("and(group_name.eq.Grupo I,predicted_team.eq.Uzbequistão),and(group_name.eq.Grupo K,predicted_team.eq.Iraque),and(group_name.eq.Grupo F,predicted_team.eq.Nova Zelândia)");

  if (error) {
    console.error("Error executing query:", error);
  } else {
    console.log("Palpites afetados:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
