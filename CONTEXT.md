# PalpiteCup

Web app (PWA) de palpites para jogos da Copa do Mundo.
15–20 usuários, grupos privados, ranking global em tempo real.

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

## Modalidades de Palpite
- **Partidas (Bets)**: Palpite no placar exato dos jogos.
- **Classificação de Grupos**: Previsão de quem passa em 1º, 2º, 3º e 4º nos grupos da Copa.
- **Mata-Mata (Bracket)**: Palpite da árvore completa, de 32avos até o campeão.
- **Jornada das Seleções**: Palpite isolado de até que fase uma seleção específica conseguirá chegar.

## Telas
1. Dashboard (jogos do dia + palpites)
2. Timeline da partida (ao vivo)
3. Ranking Global e de Grupo
4. Mata-Mata (Bracket) e modalidades extras
5. Resenha (chat do grupo)
6. Perfil, Regras e Seleção de Figurinha

## Usuários
- Autenticação via Supabase Auth (magic link ou Google)
- Perfil com figurinha de jogador (avatar) e pontuação total
