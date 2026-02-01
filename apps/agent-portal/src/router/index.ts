import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/auth/SignIn.vue'),
      meta: { guest: true },
    },
    {
      path: '/accept-invite',
      name: 'accept-invite',
      component: () => import('@/views/auth/AcceptInvite.vue'),
      meta: { guest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
      meta: { guest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPassword.vue'),
      meta: { guest: true },
    },
    // Protected routes
    {
      path: '/',
      name: 'tickets',
      component: () => import('@/views/tickets/TicketList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tickets/:id',
      name: 'ticket-detail',
      component: () => import('@/views/tickets/TicketDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agents',
      name: 'agents',
      component: () => import('@/views/agents/AgentList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agents/:id',
      name: 'agent-detail',
      component: () => import('@/views/agents/AgentDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('@/views/export/Export.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // Catch all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  // Check auth state on first navigation or if not initialized
  if (!auth.isInitialized) {
    await auth.checkAuth()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'signin', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !auth.user?.isAdmin) {
    next({ name: 'tickets' })
  } else if (to.meta.guest && auth.isAuthenticated && to.name !== 'accept-invite') {
    // Allow accept-invite even when authenticated (user may be accepting invite for a different account)
    next({ name: 'tickets' })
  } else {
    next()
  }
})

export default router
