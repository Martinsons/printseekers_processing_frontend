import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'
import './style.css'

// Add these new imports
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Toast options configuration
const toastOptions = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
}

// Create app instance
const app = createApp(App)
const pinia = createPinia()

// Add plugins
app.use(Toast, toastOptions)
app.use(pinia)
app.use(router)

// Initialize app with auth
const initApp = async () => {
    try {
        const authStore = useAuthStore()
        await authStore.initialize()
        
        // Mount app after auth is initialized
        app.mount('#app')
    } catch (error) {
        console.error('Failed to initialize app:', error)
        // You could show a toast notification here for errors
    }
}

// Start the app
initApp().catch(error => {
    console.error('Critical app initialization error:', error)
})