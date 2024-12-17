<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h2 class="text-xl font-semibold">{{ message }}</h2>
        <div v-if="!error" class="mt-4">
          <div class="animate-spin h-8 w-8 mx-auto border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../lib/supabase'
  
  export default {
    name: 'AuthCallback',
    setup() {
      const router = useRouter()
      const message = ref('Confirming your email...')
      const error = ref(false)
  
      onMounted(async () => {
        try {
          const { error: authError } = await supabase.auth.getSession()
          if (authError) throw authError
          
          message.value = 'Email confirmed! Redirecting...'
          setTimeout(() => router.push('/'), 2000)
        } catch (e) {
          error.value = true
          message.value = 'Error confirming email. Please try again.'
        }
      })
  
      return { message, error }
    }
  }
  </script>