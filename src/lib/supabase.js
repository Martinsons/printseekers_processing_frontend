import { createClient } from '@supabase/supabase-js'

class SupabaseClient {
  constructor() {
    // Return existing instance if it exists
    if (SupabaseClient.instance) {
      return SupabaseClient.instance
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Create a single client instance
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: 'app-supabase-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
        storage: window.localStorage,
        debug: false, // Enable debug logs in development
        // Add retry configuration
        retryAttempts: 3,
        retryInterval: 1000, // 1 second between retries
      },
      // Global error handler
      global: {
        headers: {
          'x-app-version': '1.0.0',
        },
      },
      // Connection pool configuration
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      // Request timeout
      db: {
        schema: 'public',
      },
      // Custom fetch implementation with timeout
      fetch: (url, options) => {
        const timeout = 30000 // 30 seconds timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId))
      },
    })

    // Add event listeners for auth state changes
    this.client.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Clear any application cache/state if needed
        localStorage.removeItem('app-supabase-auth')
      }
    })

    // Initialize auth state
    this.initializeAuth()

    // Store the instance
    SupabaseClient.instance = this
  }

  async initializeAuth() {
    try {
      const { data: { session }, error } = await this.client.auth.getSession()
      if (error) throw error

      if (session) {
        // Session exists, set up refresh timer
        this.setupRefreshTimer(session)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      // Clear any invalid session data
      localStorage.removeItem('app-supabase-auth')
    }
  }

  setupRefreshTimer(session) {
    if (!session?.expires_at) return

    const expiresAt = new Date(session.expires_at).getTime()
    const timeUntilExpiry = expiresAt - Date.now()
    const refreshBuffer = 60000 // 1 minute before expiry

    if (timeUntilExpiry > 0) {
      setTimeout(async () => {
        try {
          const { data, error } = await this.client.auth.refreshSession()
          if (error) throw error
          if (data.session) {
            this.setupRefreshTimer(data.session)
          }
        } catch (error) {
          console.error('Error refreshing session:', error)
          // Handle refresh error - maybe redirect to login
          window.location.href = '/login'
        }
      }, timeUntilExpiry - refreshBuffer)
    }
  }

  getClient() {
    return this.client
  }

  // Helper method to check if we have a valid session
  async hasValidSession() {
    try {
      const { data: { session }, error } = await this.client.auth.getSession()
      if (error) throw error
      return !!session
    } catch {
      return false
    }
  }

  // Method to handle session refresh
  async refreshSession() {
    try {
      const { data: { session }, error } = await this.client.auth.refreshSession()
      if (error) throw error
      if (session) {
        this.setupRefreshTimer(session)
        return true
      }
      return false
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }
}

// Create and export a single instance
const supabaseInstance = new SupabaseClient()
export const supabase = supabaseInstance.getClient()
export const supabaseDb = supabase

// Export helper methods
export const hasValidSession = () => supabaseInstance.hasValidSession()
export const refreshSession = () => supabaseInstance.refreshSession()