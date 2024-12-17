<template>
  <button
    @click="handleLogout"
    class="rounded-lg transition-all duration-150 hover:bg-gray-700"
    :class="[
      expanded 
        ? 'px-3 py-2 text-sm font-medium text-red-500 w-full text-center'
        : 'p-2 text-red-500'
    ]"
  >
    <span v-if="expanded">Logout</span>
    <svg 
      v-else
      xmlns="http://www.w3.org/2000/svg" 
      class="h-5 w-5" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'LogoutButton',
  props: {
    expanded: {
      type: Boolean,
      default: true
    }
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const handleLogout = () => {
      emit('logout')
    }

    return {
      handleLogout
    }
  }
}
</script>