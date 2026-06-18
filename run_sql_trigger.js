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
    const sql = `
create or replace function calculate_points()
returns trigger as $$
declare
  bet_record record;
  base_points integer;
  final_points integer;
begin
  if new.status = 'finished' then
    -- Reverte pontos anteriormente atribuídos para este jogo (idempotência: evita duplicar
    -- pontuação se o jogo for reaberto e finalizado novamente, ou se o placar for corrigido)
    for bet_record in select * from public.bets where game_id = new.id loop
      if bet_record.points_earned is not null and bet_record.points_earned != 0 then
        update public.users u
        set points_total = u.points_total - bet_record.points_earned
        where u.id = bet_record.user_id;
      end if;
    end loop;

    update public.bets set points_earned = 0 where game_id = new.id;

    -- Recalcula do zero com o placar atual
    for bet_record in select * from public.bets where game_id = new.id loop
      base_points := 0;

      if bet_record.home_bet = new.home_score and bet_record.away_bet = new.away_score then
        base_points := 5;
      elsif sign(bet_record.home_bet - bet_record.away_bet) = sign(new.home_score - new.away_score) and
            (bet_record.home_bet - bet_record.away_bet) = (new.home_score - new.away_score) then
        base_points := 3;
      elsif sign(bet_record.home_bet - bet_record.away_bet) = sign(new.home_score - new.away_score) then
        base_points := 1;
      end if;

      final_points := base_points;
      if bet_record.used_joker then
        final_points := final_points * 2;
      end if;

      update public.bets b set points_earned = final_points where b.id = bet_record.id;
      update public.users u set points_total = u.points_total + final_points where u.id = bet_record.user_id;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;
    `;
    console.log("Replacing function calculate_points()...");
    await client.query(sql);
    console.log("Function replaced successfully.");
  } catch (err) {
    console.error("Error executing sql:", err.message);
  } finally {
    await client.end();
  }
}
run();
