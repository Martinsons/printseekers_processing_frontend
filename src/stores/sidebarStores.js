import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isExpanded: true
  }),
  
  actions: {
    toggle() {
      this.isExpanded = !this.isExpanded
      // Persist state in localStorage
      localStorage.setItem('sidebarExpanded', this.isExpanded)
    },
    
    initialize() {
      // Restore state from localStorage on app initialization
      const savedState = localStorage.getItem('sidebarExpanded')
      if (savedState !== null) {
        this.isExpanded = savedState === 'true'
      }
    }
  }
})