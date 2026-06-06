export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          points_total: number
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          points_total?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          points_total?: number
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          home_team: string
          away_team: string
          kickoff_at: string
          home_score: number | null
          away_score: number | null
          status: string
          api_football_id: number | null
          group_stage: string | null
          venue: string | null
        }
        Insert: {
          id?: string
          home_team: string
          away_team: string
          kickoff_at: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          api_football_id?: number | null
          group_stage?: string | null
          venue?: string | null
        }
        Update: {
          id?: string
          home_team?: string
          away_team?: string
          kickoff_at?: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          api_football_id?: number | null
          group_stage?: string | null
          venue?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          invite_code: string
          owner_id: string
          filter_teams: string[]
          filter_phases: string[]
          filter_locked: boolean
          chat_enabled: boolean
          chat_filter_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          owner_id: string
          filter_teams?: string[]
          filter_phases?: string[]
          filter_locked?: boolean
          chat_enabled?: boolean
          chat_filter_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          owner_id?: string
          filter_teams?: string[]
          filter_phases?: string[]
          filter_locked?: boolean
          chat_enabled?: boolean
          chat_filter_enabled?: boolean
          created_at?: string
        }
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          game_id: string
          home_bet: number
          away_bet: number
          used_joker: boolean
          points_earned: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          home_bet: number
          away_bet: number
          used_joker?: boolean
          points_earned?: number | null
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          home_bet?: number
          away_bet?: number
          used_joker?: boolean
          points_earned?: number | null
          submitted_at?: string
        }
      }
      match_events: {
        Row: {
          id: string
          game_id: string
          type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
          minute: number
          team: string
          player_name: string | null
          assist_name: string | null
          player_out: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
          minute: number
          team: string
          player_name?: string | null
          assist_name?: string | null
          player_out?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          type?: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
          minute?: number
          team?: string
          player_name?: string | null
          assist_name?: string | null
          player_out?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          group_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          created_at?: string
        }
      }
      group_standings: {
        Row: {
          id: number
          group_name: string
          team: string
          played: number
          wins: number
          draws: number
          losses: number
          goals_for: number
          goals_against: number
          goal_diff: number
          points: number
          position: number | null
          updated_at: string
        }
        Insert: {
          id?: number
          group_name: string
          team: string
          played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          goal_diff?: number
          points?: number
          position?: number | null
          updated_at?: string
        }
        Update: {
          id?: number
          group_name?: string
          team?: string
          played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          goal_diff?: number
          points?: number
          position?: number | null
          updated_at?: string
        }
      }
      bracket_predictions: {
        Row: {
          id: number
          user_id: string
          round: 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'final' | 'champion'
          position: number
          predicted_team: string
          points_earned: number
          locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          round: 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'final' | 'champion'
          position: number
          predicted_team: string
          points_earned?: number
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          round?: 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'final' | 'champion'
          position?: number
          predicted_team?: string
          points_earned?: number
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface Game {
  id: string | number
  home_team: string
  away_team: string
  kickoff_at: string
  home_score: number | null
  away_score: number | null
  status: string
  api_football_id: number | null
  round_number: number | null
  group_stage: string | null
  venue: string | null
}

export interface Bet {
  id: string
  user_id: string
  game_id: string
  home_bet: number
  away_bet: number
  used_joker: boolean
  points_earned: number | null
  submitted_at: string
}

export interface Message {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Badge {
  id: string
  user_id: string
  slug: string
  earned_at: string
}

export interface GroupStanding {
  id: number
  group_name: string
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_diff: number
  points: number
  position: number | null
  updated_at: string
}

export interface BracketPrediction {
  id: number
  user_id: string
  round: 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'final' | 'champion'
  position: number
  predicted_team: string
  points_earned: number
  locked: boolean
  created_at: string
  updated_at: string
}
