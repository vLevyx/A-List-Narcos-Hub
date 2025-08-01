// types/database.ts
export type Database = {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_user_login: {
        Args: {
          target_discord_id: string
          user_name: string | null
        }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}