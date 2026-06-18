require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('group_predictions')
    .select('user_id, group_name, position, predicted_team')
    .or("and(group_name.eq.Grupo I,predicted_team.eq.Uzbequistão),and(group_name.eq.Grupo K,predicted_team.eq.Iraque),and(group_name.eq.Grupo F,predicted_team.eq.Nova Zelândia)");

  if (error) {
    console.error("Error executing query:", error);
  } else {
    console.log("Palpites afetados:", JSON.stringify(data, null, 2));
  }
}

run();
