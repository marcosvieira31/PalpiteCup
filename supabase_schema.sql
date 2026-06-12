-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (replaces profiles)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  points_total integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GAMES
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  home_team text,
  away_team text,
  kickoff_at timestamp with time zone not null,
  status text default 'pending' check (status in ('pending', 'live', 'finished')),
  home_score integer default 0,
  away_score integer default 0,
  round_id integer default 1, -- to check joker usage per round
  round_number integer,
  group_stage text,
  venue text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GROUPS
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text unique,
  owner_id uuid references public.users(id) on delete cascade not null,
  filter_teams text[] default '{}',
  filter_phases text[] default '{}',
  filter_locked boolean default false,
  chat_enabled boolean default true,
  chat_filter_enabled boolean default true,
  scoring_bets boolean default true,
  scoring_groups boolean default false,
  scoring_bracket boolean default false,
  scoring_journey boolean default false,
  scoring_groups_filter text[] default '{}',
  scoring_journey_filter text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GROUP MEMBERS
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- BETS (replaces predictions)
create table public.bets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  home_bet integer not null check (home_bet >= 0 and home_bet <= 99),
  away_bet integer not null check (away_bet >= 0 and away_bet <= 99),
  used_joker boolean default false,
  points_earned integer default 0,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, game_id)
);

-- CHAT MESSAGES (for Resenha)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BADGES
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  slug text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, slug)
);

-- MATCH EVENTS
create table public.match_events (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  type text not null check (type in ('goal', 'yellow_card', 'red_card', 'substitution')),
  minute integer not null,
  team text not null,
  player_name text,
  assist_name text,
  player_out text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REALTIME REPLICATION
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.group_members;
alter publication supabase_realtime add table public.match_events;

-- RLS POLICIES

-- USERS: everyone can view (for leaderboards), but only self can update
alter table public.users enable row level security;
create policy "Users viewable by everyone" on public.users for select using (true);
create policy "Users update own" on public.users for update using (auth.uid() = id);

-- GAMES: everyone can view, only service role can insert/update/delete (no client policy for write)
alter table public.games enable row level security;
create policy "Games viewable by everyone" on public.games for select using (true);
-- Notice: No insert/update/delete policy for games. Only Service Role can do it.

-- GROUPS: only group members can access group data
alter table public.groups enable row level security;
create policy "Group members can view their groups" on public.groups 
for select using (
  exists (select 1 from public.group_members where group_id = id and user_id = auth.uid())
);
create policy "Users can create groups" on public.groups for insert with check (auth.uid() = owner_id);

grant update on public.groups to authenticated;
create policy "Owner atualiza próprio grupo" on public.groups for update using (auth.uid() = owner_id);

-- GROUP MEMBERS: viewable only by members of the same group
alter table public.group_members enable row level security;
create policy "Users can view members of their groups" on public.group_members 
for select using (
  exists (select 1 from public.group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);
create policy "Users can join groups" on public.group_members for insert with check (auth.uid() = user_id);

-- BETS: user can read/write own bets. Can read others only if game has started.
alter table public.bets enable row level security;
create policy "Users manage own bets" on public.bets for all using (auth.uid() = user_id);

create policy "Users can view others bets after kickoff" on public.bets 
for select using (
  exists (select 1 from public.games where id = game_id and kickoff_at <= now())
);

-- MESSAGES: only members of the group can read/write
alter table public.messages enable row level security;
create policy "Group members can read messages" on public.messages
for select using (
  exists (select 1 from public.group_members where group_id = messages.group_id and user_id = auth.uid())
);
create policy "Group members can insert messages" on public.messages
for insert with check (
  auth.uid() = user_id and 
  exists (select 1 from public.group_members where group_id = messages.group_id and user_id = auth.uid())
);

-- MATCH EVENTS: viewable by everyone
alter table public.match_events enable row level security;
create policy "Match events viewable by everyone" on public.match_events for select using (true);

-- TRIGGER FOR PREVENTING BETS AFTER KICKOFF
create or replace function check_bet_cutoff()
returns trigger as $$
declare
  match_time timestamp with time zone;
begin
  if TG_OP = 'UPDATE' then
    if NEW.home IS NOT DISTINCT FROM OLD.home 
       AND NEW.away IS NOT DISTINCT FROM OLD.away 
       AND NEW.joker IS NOT DISTINCT FROM OLD.joker then
      return NEW;
    end if;
  end if;

  select kickoff_at into match_time from public.games where id = new.game_id;
  if now() >= match_time then
    raise exception 'Prazo de palpite encerrado. A partida já começou.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_bet_cutoff
  before insert or update on public.bets
  for each row execute function check_bet_cutoff();


-- FUNCTION TO CALCULATE POINTS AND TRIGGER
create or replace function calculate_points()
returns trigger as $$
declare
  bet_record record;
  base_points integer;
  final_points integer;
begin
  if new.status = 'finished' and old.status != 'finished' then
    for bet_record in select * from public.bets where game_id = new.id loop
      base_points := 0;
      
      -- Exact score: 5 points
      if bet_record.home_bet = new.home_score and bet_record.away_bet = new.away_score then
        base_points := 5;
      -- Correct winner and goal difference: 3 points
      elsif sign(bet_record.home_bet - bet_record.away_bet) = sign(new.home_score - new.away_score) and 
            (bet_record.home_bet - bet_record.away_bet) = (new.home_score - new.away_score) then
        base_points := 3;
      -- Correct winner only: 1 point
      elsif sign(bet_record.home_bet - bet_record.away_bet) = sign(new.home_score - new.away_score) then
        base_points := 1;
      end if;

      -- Joker doubles points
      final_points := base_points;
      if bet_record.used_joker then
        final_points := final_points * 2;
      end if;

      -- Update bet points
      update public.bets b set points_earned = final_points where b.id = bet_record.id;
      
      -- Update user total score
      update public.users u set points_total = u.points_total + final_points where u.id = bet_record.user_id;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger calculate_points_after_game
after update on public.games
for each row execute function calculate_points();

-- AUTO CREATE PROFILE FOR NEW USERS
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    null
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabela de posições nos grupos da Copa
create table public.group_standings (
  id serial primary key,
  group_name text not null,
  team text not null,
  played integer default 0,
  wins integer default 0,
  draws integer default 0,
  losses integer default 0,
  goals_for integer default 0,
  goals_against integer default 0,
  goal_diff integer default 0,
  points integer default 0,
  position integer,
  updated_at timestamptz default now(),
  unique(group_name, team)
);

-- Tabela de previsões de bracket
create table public.bracket_predictions (
  id serial primary key,
  user_id uuid references public.users(id) on delete cascade,
  round text not null,
  position integer not null,
  predicted_team text not null,
  points_earned integer default 0,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, round, position)
);

-- RLS
alter table public.group_standings enable row level security;
alter table public.bracket_predictions enable row level security;

-- Policies
create policy "Qualquer um lê standings"
  on public.group_standings for select using (true);

create policy "Usuário lê próprio bracket"
  on public.bracket_predictions for select using (auth.uid() = user_id);

create policy "Usuário cria próprio bracket"
  on public.bracket_predictions for insert with check (auth.uid() = user_id);

create policy "Usuário edita próprio bracket se não travado"
  on public.bracket_predictions for update using (auth.uid() = user_id and locked = false);

-- FUNÇÃO PARA CALCULAR STANDINGS E TRIGGER
create or replace function recalculate_group_standings()
returns trigger as $$
declare
  affected_group text;
  team_record record;
  pos integer := 1;
begin
  -- Só recalcula se o jogo virou 'finished' e tem grupo definido
  if NEW.status = 'finished' and NEW.group_stage is not null then
    affected_group := NEW.group_stage;

    -- Deleta standings antigas do grupo
    delete from group_standings where group_name = affected_group;

    -- Insere standings recalculadas, ordenadas por critérios FIFA
    for team_record in
      select
        team_name,
        count(*) as played,
        sum(wins) as wins,
        sum(draws) as draws,
        sum(losses) as losses,
        sum(gf) as goals_for,
        sum(ga) as goals_against,
        sum(gf) - sum(ga) as goal_diff,
        sum(pts) as points
      from (
        -- Times jogando em casa
        select
          home_team as team_name,
          case when home_score > away_score then 1 else 0 end as wins,
          case when home_score = away_score then 1 else 0 end as draws,
          case when home_score < away_score then 1 else 0 end as losses,
          home_score as gf,
          away_score as ga,
          case
            when home_score > away_score then 3
            when home_score = away_score then 1
            else 0
          end as pts
        from games
        where group_stage = affected_group
          and status = 'finished'
          and home_score is not null
          and away_score is not null

        union all

        -- Times jogando fora
        select
          away_team as team_name,
          case when away_score > home_score then 1 else 0 end as wins,
          case when away_score = home_score then 1 else 0 end as draws,
          case when away_score < home_score then 1 else 0 end as losses,
          away_score as gf,
          home_score as ga,
          case
            when away_score > home_score then 3
            when away_score = home_score then 1
            else 0
          end as pts
        from games
        where group_stage = affected_group
          and status = 'finished'
          and home_score is not null
          and away_score is not null
      ) as all_matches
      group by team_name
      order by points desc, goal_diff desc, goals_for desc, team_name asc
    loop
      insert into group_standings (
        group_name, team, played, wins, draws, losses,
        goals_for, goals_against, goal_diff, points, position, updated_at
      ) values (
        affected_group,
        team_record.team_name,
        team_record.played,
        team_record.wins,
        team_record.draws,
        team_record.losses,
        team_record.goals_for,
        team_record.goals_against,
        team_record.goal_diff,
        team_record.points,
        pos,
        now()
      );
      pos := pos + 1;
    end loop;
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trigger_recalculate_standings on games;

create trigger trigger_recalculate_standings
after update of status on games
for each row
execute function recalculate_group_standings();

-- TRIGGER TO LOCK GROUP FILTERS
create or replace function lock_group_filter()
returns trigger as $func$
begin
  if NEW.status = 'live' and OLD.status = 'scheduled' then
    update groups g
    set filter_locked = true
    where filter_locked = false
      and (
        array_length(g.filter_teams, 1) > 0
        or array_length(g.filter_phases, 1) > 0
      )
      and exists (
        select 1 from games
        where id = NEW.id
          and (
            NEW.home_team = any(g.filter_teams)
            or NEW.away_team = any(g.filter_teams)
            or NEW.group_stage = any(g.filter_phases)
          )
      );
  end if;
  return NEW;
end;
$func$ language plpgsql;

drop trigger if exists trigger_lock_group_filter on games;
create trigger trigger_lock_group_filter
after update of status on games
for each row execute function lock_group_filter();

-- Insere todos os 48 times do banco de games com posição inicial
insert into group_standings (group_name, team, position, updated_at)
select
  group_stage as group_name,
  team,
  row_number() over (partition by group_stage order by team) as position,
  now()
from (
  select group_stage, home_team as team from games where group_stage is not null and home_team is not null
  union
  select group_stage, away_team as team from games where group_stage is not null and away_team is not null
) as teams
where group_stage is not null
on conflict (group_name, team) do nothing;

-- Grants for service_role
grant select, insert, update, delete on public.games to service_role;
grant select, insert, update, delete on public.bets to service_role;
grant select, insert, update, delete on public.users to service_role;
grant select, insert, update, delete on public.groups to service_role;
grant select, insert, update, delete on public.group_members to service_role;
grant select, insert, update, delete on public.messages to service_role;
grant select, insert, update, delete on public.badges to service_role;
grant select, insert, update, delete on public.group_standings to service_role;
grant select, insert, update, delete on public.bracket_predictions to service_role;

grant usage, select on all sequences in schema public to service_role;

create table if not exists chat_read_status (
  user_id uuid references users(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  last_read_at timestamptz default now(),
  primary key (user_id, group_id)
);

alter table chat_read_status enable row level security;

create policy "Usuário gerencia próprio status"
  on chat_read_status for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant all on public.chat_read_status to authenticated;

-- Tipo do grupo e configurações
alter table groups add column if not exists type text default 'private' check (type in ('private', 'open', 'moderated'));
alter table groups add column if not exists max_members integer default null;
alter table groups add column if not exists description text default null;

-- Solicitações de entrada
create table if not exists group_requests (
  id serial primary key,
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(group_id, user_id)
);

alter table group_requests enable row level security;

create policy "Usuário vê próprias solicitações"
  on group_requests for select using (auth.uid() = user_id);

create policy "Líder vê solicitações do grupo"
  on group_requests for select using (
    exists (
      select 1 from groups
      where id = group_requests.group_id
      and owner_id = auth.uid()
    )
  );

create policy "Usuário cria solicitação"
  on group_requests for insert with check (auth.uid() = user_id);

create policy "Líder atualiza solicitações"
  on group_requests for update using (
    exists (
      select 1 from groups
      where id = group_requests.group_id
      and owner_id = auth.uid()
    )
  );

grant all on public.group_requests to authenticated;
grant usage, select, update on sequence group_requests_id_seq to authenticated;

-- Notificações
create table if not exists notifications (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Usuário gerencia próprias notificações"
  on notifications for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant all on public.notifications to authenticated;
grant usage, select, update on sequence notifications_id_seq to authenticated;

-- Realtime
alter publication supabase_realtime add table group_requests;
alter publication supabase_realtime add table notifications;

-- Palpites de classificação dos grupos
create table if not exists group_predictions (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  group_name text not null,
  position integer not null check (position between 1 and 4),
  predicted_team text not null,
  points_earned integer default 0,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, group_name, position)
);

-- Palpites do bracket completo (fase de 32 até final)
create table if not exists bracket_picks (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  round text not null check (round in (
    'phase_of_32', 'round_of_16', 'quarter_final',
    'semi_final', 'third_place', 'final', 'champion'
  )),
  match_number integer not null,
  predicted_team text not null,
  points_earned integer default 0,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, round, match_number)
);

-- Palpites de até onde vai cada seleção
create table if not exists team_journey_predictions (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  team text not null,
  predicted_phase text not null check (predicted_phase in (
    'group_stage', 'phase_of_32', 'round_of_16',
    'quarter_final', 'semi_final', 'third_place',
    'runner_up', 'champion'
  )),
  points_earned integer default 0,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, team)
);

-- RLS
alter table group_predictions enable row level security;
alter table bracket_picks enable row level security;
alter table team_journey_predictions enable row level security;

-- Policies
create policy "Usuário gerencia próprios palpites de grupo"
  on group_predictions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Palpites de grupo visíveis para autenticados após travamento"
  on group_predictions for select
  using (
    auth.uid() = user_id or locked = true
  );

create policy "Usuário gerencia próprio bracket"
  on bracket_picks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Bracket visível para autenticados após travamento"
  on bracket_picks for select
  using (
    auth.uid() = user_id or locked = true
  );

create policy "Usuário gerencia próprios palpites de jornada"
  on team_journey_predictions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Jornada visível para autenticados após travamento"
  on team_journey_predictions for select
  using (
    auth.uid() = user_id or locked = true
  );

-- Grants
grant all on public.group_predictions to authenticated;
grant all on public.bracket_picks to authenticated;
grant all on public.team_journey_predictions to authenticated;
grant usage, select, update on sequence group_predictions_id_seq to authenticated;
grant usage, select, update on sequence bracket_picks_id_seq to authenticated;
grant usage, select, update on sequence team_journey_predictions_id_seq to authenticated;

-- Realtime
alter publication supabase_realtime add table group_predictions;
alter publication supabase_realtime add table bracket_picks;
alter publication supabase_realtime add table team_journey_predictions;

NOTIFY pgrst, 'reload schema';

-- Quais modalidades o líder ativa para o grupo
alter table groups add column if not exists scoring_bets boolean default true;
alter table groups add column if not exists scoring_groups boolean default false;
alter table groups add column if not exists scoring_bracket boolean default false;
alter table groups add column if not exists scoring_journey boolean default false;

NOTIFY pgrst, 'reload schema';
