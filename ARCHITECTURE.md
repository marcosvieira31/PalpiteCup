# Arquitetura

## Fluxo de dados
Client → Supabase (cache) ← Cron Job → API-Football

## Cron
- /api/cron/sync-scores
- 60s durante jogos ao vivo
- 1x/dia fora de jogos
- Protegido por CRON_SECRET no header

## Segurança
- SUPABASE_SERVICE_ROLE_KEY apenas server-side
- RLS ativo em todas as tabelas
- Palpites bloqueados via Postgres Rule após kickoff_at
- Pontuação calculada via Postgres Function (trigger)

## Variáveis de Ambiente
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
API_FOOTBALL_KEY
