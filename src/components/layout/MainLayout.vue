<template>
  <div class="h-screen flex">
    <!-- Show layout with sidebar for authenticated routes -->
    <template v-if="authStore.user && !isLoginRoute">
      <Sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white shadow z-10">
          <div class="px-4 py-4 sm:px-6 flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">{{ currentPageTitle }}</h1>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-600">
                  {{ authStore.user?.email }}
                </span>
                <button 
                  @click="handleLogout"
                  class="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Suspense>
            <template #default>
              <slot></slot>
            </template>
            <template #fallback>
              <div class="flex justify-center items-center h-full">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </template>
          </Suspense>
        </main>
      </div>
    </template>

    <!-- Show only content without layout for non-authenticated routes -->
    <template v-else>
      <slot></slot>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from 'vue-toastification'
import Sidebar from './Sidebar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isLoginRoute = computed(() => route.path === '/login')

const currentPageTitle = computed(() => {
  const path = route.path.split('/')[1]
  if (!path) return 'Dashboard'
  
  return path
    .split('-')
    .map(word => {
      if (word.toLowerCase() === 'fedex') return 'FedEx'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
})

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    toast.success('Logged out successfully')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    toast.error('Failed to logout')
  }
}

// Watch for auth state changes
watch(() => authStore.user, (newUser) => {
  if (!newUser && !isLoginRoute.value) {
    router.push('/login')
  }
})

// Check auth on mount
onMounted(() => {
  if (!authStore.user && !isLoginRoute.value) {
    router.push('/login')
  }
})

// Handle auth errors
watch(() => authStore.error, (newError) => {
  if (newError) {
    toast.error(newError)
  }
})
</script>

<style scoped>
/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure header stays on top */
header {
  position: relative;
  z-index: 20;
}

/* Improve scrollbar appearance */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Improve button focus states */
button:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Remove focus outline for mouse users */
button:focus:not(:focus-visible) {
  outline: none;
}
</style>