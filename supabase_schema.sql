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
  home_team text not null,
  away_team text not null,
  kickoff_at timestamp with time zone not null,
  status text default 'pending' check (status in ('pending', 'live', 'finished')),
  home_score integer default 0,
  away_score integer default 0,
  round_id integer default 1, -- to check joker usage per round
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GROUPS
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text unique,
  owner_id uuid references public.users(id) on delete cascade not null,
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
  home_bet integer not null,
  away_bet integer not null,
  is_joker boolean default false,
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

-- REALTIME REPLICATION
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.group_members;

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

-- TRIGGER FOR PREVENTING BETS AFTER KICKOFF
create or replace function check_bet_cutoff()
returns trigger as $$
declare
  match_time timestamp with time zone;
begin
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
      if bet_record.is_joker then
        final_points := final_points * 2;
      end if;

      -- Update bet points
      update public.bets set points_earned = final_points where id = bet_record.id;
      
      -- Update user total score
      update public.users set points_total = points_total + final_points where id = bet_record.user_id;
    end loop;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_game_finished
  after update of status on public.games
  for each row
  execute function calculate_points();

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
