// import { ref } from 'vue'

// // Create a reactive reference that can be shared across components
// export const sidebarState = ref(true) // true = expanded by default

// // Optional: Create composable for sidebar functionality
// export function useSidebar() {
//   const toggleSidebar = () => {
//     sidebarState.value = !sidebarState.value
//   }

//   const setSidebarState = (state) => {
//     sidebarState.value = state
//   }

//   return {
//     sidebarState,
//     toggleSidebar,
//     setSidebarState
//   }
// }