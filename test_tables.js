const fs = require('fs');
const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = envLocal.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    acc[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  try {
    const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const spec = await res.json();
    console.log("Tables:");
    Object.keys(spec.definitions).forEach(t => console.log(t));
  } catch (e) {
    console.error(e);
  }
}
run();
