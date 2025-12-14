import { supabase } from './supabase'
import type { VotingPosition, Leadership } from './supabase'

// Voting Positions API
export const votingPositionsAPI = {
    async getAll() {
        const { data, error } = await supabase
            .from('voting_positions')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as VotingPosition[]
    },

    async create(position: Omit<VotingPosition, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('voting_positions')
            .insert([position])
            .select()

        if (error) throw error
        return data[0] as VotingPosition
    },

    async update(id: string, position: Partial<VotingPosition>) {
        const { data, error } = await supabase
            .from('voting_positions')
            .update({ ...position, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0] as VotingPosition
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('voting_positions')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

// Leadership API
export const leadershipAPI = {
    async getAll() {
        const { data, error } = await supabase
            .from('leadership')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Leadership[]
    },

    async create(leader: Omit<Leadership, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('leadership')
            .insert([leader])
            .select()

        if (error) throw error
        return data[0] as Leadership
    },

    async update(id: string, leader: Partial<Leadership>) {
        const { data, error } = await supabase
            .from('leadership')
            .update({ ...leader, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0] as Leadership
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('leadership')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

// Image Upload
export const uploadImage = async (file: File, bucket: string = 'candidate-images') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return data.publicUrl
}
