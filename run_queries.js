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
    console.log("--- QUERY 1: Argentina x Argélia ---");
    const res1 = await client.query(`
      select id, home_team, away_team, status, home_score, away_score, group_stage
      from games
      where home_team = 'Argentina' and away_team = 'Argélia';
    `);
    console.table(res1.rows);

    console.log("\n--- QUERY 2: Palpites para o jogo ---");
    const res2 = await client.query(`
      select * from bets where game_id = (
        select id from games where home_team = 'Argentina' and away_team = 'Argélia' limit 1
      );
    `);
    console.table(res2.rows);

    console.log("\n--- QUERY 3: Filtros dos grupos ---");
    const res3 = await client.query(`
      select id, name, filter_teams, filter_phases from groups where name in ('Faxina [OFICIAL]', 'BOLÃO CPM');
    `);
    console.table(res3.rows);

  } catch (err) {
    console.error("Error executing sql:", err.message);
  } finally {
    await client.end();
  }
}
run();
