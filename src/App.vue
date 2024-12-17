<template>
  <AuthProvider>
    <!-- Show loading state while initializing auth -->
    <div v-if="loading" class="h-screen flex items-center justify-center bg-gray-50">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Show MainLayout for authenticated users -->
    <Suspense v-else>
      <template #default>
        <MainLayout v-if="authStore.user">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </MainLayout>

        <!-- Show login view for unauthenticated users -->
        <template v-else>
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </template>
      </template>

      <!-- Loading fallback -->
      <template #fallback>
        <div class="h-screen flex items-center justify-center bg-gray-50">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </template>
    </Suspense>
  </AuthProvider>
</template>

<script setup>
import { ref, onMounted, onErrorCaptured } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useToast } from 'vue-toastification'
import MainLayout from './components/layout/MainLayout.vue'
import AuthProvider from './components/AuthProvider.vue'

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(true)
const error = ref(null)

// Initialize auth
onMounted(async () => {
  try {
    await authStore.initialize()
  } catch (err) {
    console.error('Failed to initialize auth:', err)
    toast.error('Failed to initialize application')
  } finally {
    loading.value = false
  }
})

// Handle errors
onErrorCaptured((err) => {
  console.error('Application error:', err)
  error.value = err
  toast.error('An error occurred')
  return false // Prevent error from propagating
})
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

/* Global styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: rgb(17, 24, 39);
  background-color: rgb(249, 250, 251);
}

/* Smooth scrolling for modern browsers */
html {
  scroll-behavior: smooth;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animation keyframes */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Prevent layout shift during loading */
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Improve focus visibility */
:focus {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}

/* Remove focus outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
</style>