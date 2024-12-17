import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

// Define routes
const routes = [
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Login'
    }
  },
  // Protected routes
  {
    path: '/',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/fedex-bill-processing'
      },
      {
        path: 'downloads',
        name: 'Downloads',
        component: () => import('../views/Downloads.vue'),
        meta: {
          title: 'Downloads',
          requiresAuth: true
        }
      },
      {
        path: 'fedex-bill-processing',
        name: 'FedexBillProcessing',
        component: () => import('../views/FedexBillProcessing.vue'),
        meta: {
          title: 'FedEx Bill Processing',
          requiresAuth: true
        }
      },
      {
        path: 'fedex-tracking',
        name: 'FedexTracking',
        component: () => import('../views/FedexTracking.vue'),
        meta: {
          title: 'FedEx Tracking',
          requiresAuth: true
        }
      },
      {
        path: 'invoice-search',
        name: 'InvoiceSearch',
        component: () => import('../views/InvoiceSearch.vue'),
        meta: {
          title: 'Invoice Search',
          requiresAuth: true
        }
      },
      {
        path: 'invoice-upload',
        name: 'ShippingCostComparison',
        component: () => import('../views/ShippingCostComparison.vue'),
        meta: {
          title: 'Shipping Cost Comparison',
          requiresAuth: true
        }
      },
      {
        // 404 route
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: {
          title: 'Page Not Found'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  try {
    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Handle session state
    if (session?.user) {
      // If we have a valid session, update the store
      authStore.user = session.user
      authStore.session = session
    } else {
      // If no session, clear the store
      authStore.user = null
      authStore.session = null
    }

    // Setup auth state change listener (only once)
    if (!router.authListener) {
      router.authListener = supabase.auth.onAuthStateChange(
        async (event, session) => {
          switch (event) {
            case 'SIGNED_IN':
              authStore.user = session.user
              authStore.session = session
              // If there's a saved redirect path, use it
              const redirectPath = localStorage.getItem('redirectAfterLogin')
              if (redirectPath) {
                localStorage.removeItem('redirectAfterLogin')
                router.push(redirectPath)
              }
              break;
            case 'SIGNED_OUT':
              authStore.user = null
              authStore.session = null
              router.push('/login')
              break;
            case 'TOKEN_REFRESHED':
              authStore.user = session.user
              authStore.session = session
              break;
          }
        }
      )
    }

    // Handle route access
    if (requiresAuth && !authStore.user) {
      // Save the intended destination
      localStorage.setItem('redirectAfterLogin', to.fullPath)
      // Redirect to login
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else if (to.path === '/login' && authStore.user) {
      // Redirect to home if user is already authenticated
      next('/fedex-bill-processing')
    } else {
      // Allow navigation
      next()
    }

  } catch (error) {
    console.error('Navigation error:', error)
    // Clear auth state on error
    authStore.user = null
    authStore.session = null
    next('/login')
  }
})

// Update document title
router.afterEach((to) => {
  document.title = to.meta.title 
    ? `${to.meta.title} - Batch Processing App`
    : 'Batch Processing App'
})

// Cleanup auth listener when router is destroyed
router.onError(() => {
  if (router.authListener) {
    router.authListener.unsubscribe()
  }
})

export default router