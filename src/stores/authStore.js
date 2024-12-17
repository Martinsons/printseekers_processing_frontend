// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const session = ref(null)
  let authSubscription = null

  const isAuthenticated = computed(() => !!user.value && !!session.value)

  const setState = (newUser, newSession) => {
    user.value = newUser
    session.value = newSession
    loading.value = false
    error.value = null
  }

  const clearState = () => {
    user.value = null
    session.value = null
    loading.value = false
    error.value = null
    // Clear any stored tokens
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('supabase.auth.refreshToken')
  }

  const cleanup = () => {
    if (authSubscription) {
      authSubscription.unsubscribe()
      authSubscription = null
    }
  }

  const initialize = async () => {
    // Clean up any existing subscription before initializing
    cleanup()
    
    try {
      loading.value = true
      error.value = null

      // Get initial session
      const { data: { session: currentSession }, error: sessionError } = 
        await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (currentSession) {
        setState(currentSession.user, currentSession)
      } else {
        clearState()
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          switch (event) {
            case 'SIGNED_IN':
              setState(currentSession.user, currentSession)
              break
            case 'SIGNED_OUT':
              clearState()
              router.push('/login')
              break
            case 'TOKEN_REFRESHED':
              setState(currentSession.user, currentSession)
              break
            case 'USER_UPDATED':
              setState(currentSession.user, currentSession)
              break
            case 'INITIAL_SESSION':
              if (currentSession) {
                setState(currentSession.user, currentSession)
              } else {
                clearState()
              }
              break
          }
        }
      )
      authSubscription = subscription

    } catch (err) {
      console.error('Error initializing auth:', err)
      clearState()
      if (err.message.includes('Invalid Refresh Token')) {
        router.push('/login')
      }
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true,
          // Add a little buffer before expiry
          expiryMargin: 60 // 60 seconds
        }
      })

      if (authError) throw authError
      
      setState(data.user, data.session)
      return { data, error: null }

    } catch (err) {
      error.value = err.message
      clearState()
      return { data: null, error: err }
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'local'
      })
      
      if (signOutError) throw signOutError
      
      clearState()
      router.push('/login')

    } catch (err) {
      console.error('Error signing out:', err)
      error.value = err.message
      // Clear state anyway to prevent being stuck
      clearState()
      router.push('/login')
    } finally {
      loading.value = false
    }
  }

  const handleSessionError = async (err) => {
    console.error('Session error:', err)
    if (err.message.includes('Invalid Refresh Token')) {
      clearState()
      router.push('/login')
    }
    return false
  }

  const checkSession = async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = 
        await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (currentSession) {
        setState(currentSession.user, currentSession)
        return true
      }
      
      clearState()
      return false

    } catch (err) {
      return handleSessionError(err)
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession()
      
      if (refreshError) throw refreshError
      
      if (refreshedSession) {
        setState(refreshedSession.user, refreshedSession)
        return true
      }
      
      clearState()
      return false

    } catch (err) {
      return handleSessionError(err)
    }
  }

  return {
    user,
    loading,
    error,
    session,
    isAuthenticated,
    initialize,
    login,
    logout,
    cleanup,
    checkSession,
    refreshSession
  }
})