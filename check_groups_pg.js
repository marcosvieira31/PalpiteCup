const { Client } = require('pg');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = envLocal.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    acc[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const connectionString = env.DATABASE_URL;

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  
  try {
    const res = await client.query(`
      select user_id, group_name, position, predicted_team
      from group_predictions
      where (group_name = 'Grupo I' and predicted_team = 'Uzbequistão')
         or (group_name = 'Grupo K' and predicted_team = 'Iraque')
         or (group_name = 'Grupo F' and predicted_team = 'Nova Zelândia');
    `);
    console.log("Palpites afetados:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error executing query:", err.message);
  } finally {
    await client.end();
  }
}
run();
