import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface VotingPosition {
    id: string
    name: string
    role: string
    image_url: string | null
    created_at: string
    updated_at: string
}

export interface Leadership {
    id: string
    name: string
    role: string
    image_url: string | null
    created_at: string
    updated_at: string
}
