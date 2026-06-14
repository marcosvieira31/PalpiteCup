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
    console.log("Dropping trigger calculate_points_after_game...");
    await client.query(`DROP TRIGGER IF EXISTS calculate_points_after_game ON public.games;`);
    
    console.log("Updating game 1 to finished...");
    await client.query(`UPDATE public.games SET status = 'finished' WHERE api_football_id = 1;`);
    console.log("Success! The calculate_points trigger was the problem.");

  } catch (err) {
    console.error("Error with calculate_points dropped:", err.message);
  } finally {
    // restore it just in case
    await client.query(`
      create trigger calculate_points_after_game
      after update on public.games
      for each row execute function calculate_points();
    `);
    await client.query(`UPDATE public.games SET status = 'scheduled' WHERE api_football_id = 1;`);
    await client.end();
  }
}
run();
