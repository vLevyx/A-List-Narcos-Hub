export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          discord_id: string
          username: string | null
          created_at: string
          revoked: boolean
          last_login: string | null
          login_count: number
          hub_trial: boolean
          trial_expiration: string | null
        }
        Insert: {
          id?: string
          discord_id: string
          username?: string | null
          created_at?: string
          revoked?: boolean
          last_login?: string | null
          login_count?: number
          hub_trial?: boolean
          trial_expiration?: string | null
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string | null
          created_at?: string
          revoked?: boolean
          last_login?: string | null
          login_count?: number
          hub_trial?: boolean
          trial_expiration?: string | null
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string | null
          admin_name: string | null
          action: string | null
          target_discord_id: string | null
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          admin_id?: string | null
          admin_name?: string | null
          action?: string | null
          target_discord_id?: string | null
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          admin_id?: string | null
          admin_name?: string | null
          action?: string | null
          target_discord_id?: string | null
          description?: string | null
          created_at?: string | null
        }
      }
      page_sessions: {
        Row: {
          id: string
          discord_id: string
          username: string | null
          page_path: string
          enter_time: string | null
          exit_time: string | null
          time_spent_seconds: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discord_id: string
          username?: string | null
          page_path: string
          enter_time?: string | null
          exit_time?: string | null
          time_spent_seconds?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string | null
          page_path?: string
          enter_time?: string | null
          exit_time?: string | null
          time_spent_seconds?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      user_blueprints: {
        Row: {
          id: string
          discord_id: string
          blueprint_name: string
          created_at: string
        }
        Insert: {
          id?: string
          discord_id: string
          blueprint_name: string
          created_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          blueprint_name?: string
          created_at?: string
        }
      }
      scam_list: {
        Row: {
          id: string
          in_game_name: string
          discord_name: string | null
          discord_id: string | null
          description: string
          evidence_url: string | null
          verified: boolean
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          in_game_name: string
          discord_name?: string | null
          discord_id?: string | null
          description: string
          evidence_url?: string | null
          verified?: boolean
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          in_game_name?: string
          discord_name?: string | null
          discord_id?: string | null
          description?: string
          evidence_url?: string | null
          verified?: boolean
          added_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      upsert_user_login: {
        Args: {
          target_discord_id: string
          user_name?: string
        }
        Returns: any
      }
      start_trial: {
        Args: {
          discord_id_input: string
        }
        Returns: void
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      admin_whitelist_user: {
        Args: {
          target_discord_id: string
        }
        Returns: void
      }
      admin_revoke_user: {
        Args: {
          target_discord_id: string
        }
        Returns: void
      }
      admin_add_trial: {
        Args: {
          target_discord_id: string
          days: number
        }
        Returns: void
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type AdminLog = Database['public']['Tables']['admin_logs']['Row']
export type PageSession = Database['public']['Tables']['page_sessions']['Row']
export type UserBlueprint = Database['public']['Tables']['user_blueprints']['Row']
export type ScamListEntry = Database['public']['Tables']['scam_list']['Row']

export interface UserWithAccess extends User {
  hasAccess: boolean
  isTrialActive: boolean
}