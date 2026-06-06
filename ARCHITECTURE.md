# Arquitetura

## Fluxo de dados
Client → Supabase (cache) ← Cron Job → WC2026 API

## Cron
- /api/cron/sync-scores
- 60s durante jogos ao vivo
- 1x/dia fora de jogos
- Protegido por CRON_SECRET no header

## Segurança e Regras
- Criptografia de senhas nativa (bcrypt) pelo Supabase Auth.
- Rate Limiting via Middleware (100 req/min/IP para rotas `/api/`).
- Validação server-side robusta com Zod nas Server Actions (`betSchema`, etc).
- Proteção anti-spam no chat do Supabase via função PL/pgSQL (max 3 msgs/5s).
- CSP (Content Security Policy) estrito via headers HTTP customizados.
- SUPABASE_SERVICE_ROLE_KEY apenas server-side.
- RLS ativo em todas as tabelas (incluindo bracket_predictions e users).
- Palpites de jogos bloqueados logicamente e no banco após kickoff_at.
- Bracket (Mata-Mata) travado globalmente após início da 2ª rodada da fase de grupos.
- Pontuação calculada via Postgres Function (trigger).
- Ranking Global servido em tempo real via Supabase Realtime (postgres_changes).

## Variáveis de Ambiente
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
WC2026_API_KEY

## Execução Local / Deploy
Cron executa a cada 60s via Vercel
Em produção o header x-cron-secret é enviado automaticamente pela Vercel
Localmente testar via: curl -H "x-cron-secret: SEU_CRON_SECRET" http://localhost:3000/api/cron/sync-scores
