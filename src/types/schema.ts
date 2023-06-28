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
      button: {
        Row: {
          button_id: number
          created_at: string | null
          id: number
          minted: boolean
          nft_creator_address: string
          nft_ipfs_uri: string
        }
        Insert: {
          button_id: number
          created_at?: string | null
          id?: number
          minted?: boolean
          nft_creator_address: string
          nft_ipfs_uri: string
        }
        Update: {
          button_id?: number
          created_at?: string | null
          id?: number
          minted?: boolean
          nft_creator_address?: string
          nft_ipfs_uri?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

