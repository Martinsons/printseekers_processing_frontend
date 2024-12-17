<template>
  <aside 
    class="h-screen bg-[#1e2537] text-white flex flex-col transition-all duration-300"
    :class="{ 'w-64': isExpanded, 'w-20': !isExpanded }"
  >
    <!-- Sidebar Header -->
    <div class="h-16 flex items-center px-4 border-b border-gray-700">
      <!-- Only show Dashboard text when expanded -->
      <span v-if="isExpanded" class="text-xl font-semibold truncate">
        Dashboard
      </span>
      
      <!-- Center the button when collapsed, push right when expanded -->
      <button 
        @click="toggleSidebar" 
        class="p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-300"
        :class="{ 'ml-auto': isExpanded, 'mx-auto': !isExpanded }"
      >
        <svg 
          :class="{ 'transform rotate-180': !isExpanded }"
          class="w-5 h-5 transition-transform duration-200"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <div class="space-y-1 px-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
          :class="[
            route.path === item.path 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
            isExpanded ? 'justify-start' : 'justify-center'
          ]"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span 
            v-if="isExpanded" 
            class="ml-3"
          >
            {{ item.name }}
          </span>
        </router-link>
      </div>
    </nav>

    <!-- User Section -->
    <div class="p-4 border-t border-gray-700">
      <div 
        class="flex flex-col space-y-3"
        :class="{ 'items-center': !isExpanded }"
      >
        <!-- Only show email when expanded -->
        <div 
          v-if="isExpanded"
          class="text-sm font-medium text-white truncate"
        >
          {{ authStore.user?.email }}
        </div>
        
        <!-- Custom logout button that changes based on sidebar state -->
        <LogoutButton 
          :expanded="isExpanded"
          @logout="handleLogout"
        />
          
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../../stores/authStore'
import LogoutButton from '../common/LogoutButton.vue'

export default {
  name: 'Sidebar',
  
  components: {
    LogoutButton
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isExpanded = ref(true)
    const toast = useToast()

    const menuItems = [
      { name: 'Fedex Bill Processing', path: '/fedex-bill-processing', icon: '📑' },
      { name: 'Invoice apstrade', path: '/invoice-upload', icon: '⬆️' },
      { name: 'Invoice search', path: '/invoice-search', icon: '🔍' },
      { name: 'Fedex Tracking', path: '/fedex-tracking', icon: '📦' },
      
    ]

    const toggleSidebar = () => {
      isExpanded.value = !isExpanded.value
      localStorage.setItem('sidebarExpanded', isExpanded.value)
    }

    // Add handleLogout method
    const handleLogout = async () => {
      try {
        await authStore.logout()
        toast?.success('Logged out successfully')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        toast?.error('Failed to logout')
      }
    }


    onMounted(() => {
      // Restore sidebar state from localStorage
      const savedState = localStorage.getItem('sidebarExpanded')
      if (savedState !== null) {
        isExpanded.value = savedState === 'true'
      }
    })

    return {
      route,
      authStore,
      isExpanded,
      toggleSidebar,
      menuItems,
      handleLogout
    }
  }
}
</script>

<style scoped>
.router-link-active {
  background-color: rgb(17, 24, 39);
  color: white;
}

/* Hide scrollbar but maintain functionality */
nav {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

nav::-webkit-scrollbar {
  display: none;
}
</style>