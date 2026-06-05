# PalpiteCup

Web app de palpites para jogos da Copa do Mundo.
15–20 usuários, grupos privados, ranking em tempo real.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (Postgres + Auth + Realtime + RLS)
- Vercel (deploy + cron jobs)
- API-Football (plano free, 100 req/dia)

## Regras de Pontuação
- 5 pts → placar exato
- 3 pts → vencedor + diferença de gols
- 1 pt → vencedor ou empate correto
- Coringa → dobra os pontos (1 uso por rodada)

## Telas
1. Dashboard (jogos do dia + palpites)
2. Timeline da partida (ao vivo)
3. Ranking do grupo
4. Resenha (chat do grupo)

## Usuários
- Autenticação via Supabase Auth (magic link ou Google)
- Perfil com avatar e pontuação total
