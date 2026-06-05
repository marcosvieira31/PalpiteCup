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
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          invite_code: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          owner_id?: string
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
          is_joker: boolean
          points_earned: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          home_bet: number
          away_bet: number
          is_joker?: boolean
          points_earned?: number | null
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          home_bet?: number
          away_bet?: number
          is_joker?: boolean
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
    }
  }
}
