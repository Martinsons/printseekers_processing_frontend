<!-- src/components/AuthProvider.vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})

onUnmounted(() => {
  authStore.cleanup()
})
</script>

<template>
  <slot></slot>
</template>
