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

// Voters API
export const votersAPI = {
    async create(voter: { full_name: string; email: string; phone_number: string }) {
        // Try to create new voter first (most common case)
        const { data, error } = await supabase
            .from('voters')
            .insert([voter])
            .select()
            .single()

        // If successful, return the new voter
        if (!error && data) return data

        // If error is duplicate email (23505), fetch and return existing voter
        if (error && error.code === '23505') {
            const { data: existing, error: fetchError } = await supabase
                .from('voters')
                .select('*')
                .eq('email', voter.email)
                .maybeSingle()

            if (!fetchError && existing) return existing
        }

        // For any other error, throw it
        if (error) throw error
        return data
    },

    async getByEmail(email: string) {
        const { data, error } = await supabase
            .from('voters')
            .select('*')
            .eq('email', email)
            .maybeSingle()

        if (error) throw error
        return data
    },

    async checkIfAlreadyVoted(email: string, phoneNumber: string) {
        // FIRST: Check voting history (permanent record, even if deleted)
        const { data: historyData, error: historyError } = await supabase
            .from('voting_history')
            .select('*')
            .or(`email.eq.${email},phone_number.eq.${phoneNumber}`)
            .maybeSingle()

        if (historyError && historyError.code !== 'PGRST116') {
            // Ignore "no rows" error, throw others
            console.error('Error checking voting history:', historyError)
        }

        // If found in history, they already voted (even if deleted by admin)
        if (historyData) {
            const wasDeleted = historyData.deleted_at ? ' (deleted by admin)' : ''
            return {
                hasVoted: true,
                voter: {
                    id: historyData.original_voter_id || historyData.id,
                    full_name: historyData.full_name,
                    email: historyData.email,
                    phone_number: historyData.phone_number
                },
                voteDate: historyData.voted_at,
                message: `You already voted on ${new Date(historyData.voted_at).toLocaleString()}${wasDeleted}. Don't cheat on us! 😊`
            }
        }

        // SECOND: Check current voters table
        const { data, error } = await supabase
            .from('voters')
            .select(`
                id,
                full_name,
                email,
                phone_number,
                candidate_rankings (
                    id,
                    created_at
                )
            `)
            .or(`email.eq.${email},phone_number.eq.${phoneNumber}`)
            .maybeSingle()

        if (error) throw error

        // If voter exists and has rankings, they already voted
        if (data && data.candidate_rankings && data.candidate_rankings.length > 0) {
            return {
                hasVoted: true,
                voter: data,
                voteDate: data.candidate_rankings[0].created_at,
                message: `You already voted on ${new Date(data.candidate_rankings[0].created_at).toLocaleString()}. Don't cheat on us! 😊`
            }
        }

        return { hasVoted: false, voter: null, voteDate: null, message: null }
    }
}

// Vote Attempts API (for logging all attempts)
export const voteAttemptsAPI = {
    async logAttempt(attempt: {
        full_name: string;
        email: string;
        phone_number: string;
        attempt_status: 'success' | 'rejected_duplicate_email' | 'rejected_duplicate_phone' | 'rejected_already_voted';
        rejection_reason?: string;
        existing_voter_id?: string;
    }) {
        const { data, error } = await supabase
            .from('vote_attempts')
            .insert([attempt])
            .select()
            .single()

        if (error) {
            console.error('Error logging vote attempt:', error)
            // Don't throw - logging failure shouldn't block voting
        }
        return data
    },

    async getAttemptsByEmail(email: string) {
        const { data, error } = await supabase
            .from('vote_attempts')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getAttemptsByPhone(phoneNumber: string) {
        const { data, error } = await supabase
            .from('vote_attempts')
            .select('*')
            .eq('phone_number', phoneNumber)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getAllAttempts(limit: number = 100) {
        const { data, error } = await supabase
            .from('vote_attempts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data
    },

    async getAttemptStats() {
        const { data, error } = await supabase
            .from('vote_attempts')
            .select('attempt_status')

        if (error) throw error

        const stats = {
            total: data.length,
            successful: data.filter(a => a.attempt_status === 'success').length,
            rejected: data.filter(a => a.attempt_status.startsWith('rejected')).length,
            rejectedDuplicateEmail: data.filter(a => a.attempt_status === 'rejected_duplicate_email').length,
            rejectedDuplicatePhone: data.filter(a => a.attempt_status === 'rejected_duplicate_phone').length,
            rejectedAlreadyVoted: data.filter(a => a.attempt_status === 'rejected_already_voted').length
        }

        return stats
    }
}

// Candidate Rankings API
export const rankingsAPI = {
    async submitRankings(voterId: string, rankings: Array<{
        candidateId: string;
        positionSlot: string;
        rankOrder: number;
        rating: number;
    }>) {
        // Delete existing rankings for this voter
        await supabase
            .from('candidate_rankings')
            .delete()
            .eq('voter_id', voterId)

        // Insert new rankings
        const rankingsData = rankings.map(r => ({
            voter_id: voterId,
            candidate_id: r.candidateId,
            position_slot: r.positionSlot,
            rank_order: r.rankOrder,
            rating: r.rating
        }))

        const { data, error } = await supabase
            .from('candidate_rankings')
            .insert(rankingsData)
            .select()

        if (error) throw error
        return data
    },

    async getVoterRankings(voterId: string) {
        const { data, error } = await supabase
            .from('candidate_rankings')
            .select(`
                *,
                candidate:voting_positions(*)
            `)
            .eq('voter_id', voterId)
            .order('position_slot')
            .order('rank_order')

        if (error) throw error
        return data
    },

    async getAllRankings() {
        const { data, error } = await supabase
            .from('candidate_rankings')
            .select(`
                *,
                voter:voters(*),
                candidate:voting_positions(*)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getCandidateStats(candidateId: string) {
        const { data, error } = await supabase
            .from('candidate_rankings')
            .select('rating, position_slot')
            .eq('candidate_id', candidateId)

        if (error) throw error

        if (!data || data.length === 0) {
            return {
                averageRating: 0,
                totalVotes: 0,
                positionBreakdown: {}
            }
        }

        const totalVotes = data.length
        const averageRating = data.reduce((sum, r) => sum + Number(r.rating), 0) / totalVotes
        const positionBreakdown = data.reduce((acc, r) => {
            acc[r.position_slot] = (acc[r.position_slot] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalVotes,
            positionBreakdown
        }
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
