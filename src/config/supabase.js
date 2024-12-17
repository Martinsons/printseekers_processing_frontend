import { createClient } from '@supabase/supabase-js'

// Auth client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DB client
const supabaseDbUrl = import.meta.env.VITE_SUPABASE_URL_DB
const supabaseDbKey = import.meta.env.VITE_SUPABASE_ANON_KEY_DB

if (!supabaseUrl || !supabaseKey || !supabaseDbUrl || !supabaseDbKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create two clients - one for auth and one for DB operations
export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseDb = createClient(supabaseDbUrl, supabaseDbKey)

export const dbOperations = {
  async updateField({ tableName, recordId, fieldName, value }) {
    try {
      const { data, error } = await supabaseDb
        .from(tableName)
        .update({ [fieldName]: value })
        .eq('id', recordId)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Database update error:', error)
      return { data: null, error }
    }
  },

  async searchRecords({ table, searchType, searchValue }) {
    try {
      const { data, error } = await supabaseDb
        .from(table)
        .select('*')
        .or(searchType === 'invoice' 
          ? `invoice_number.ilike.%${searchValue}%`
          : `tracking_number.eq.${searchValue}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Database search error:', error)
      return { data: null, error }
    }
  }
}