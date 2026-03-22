import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/workspace/:id',
    name: 'Workspace',
    component: () => import('@/views/WorkspaceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/templates',
    name: 'TemplatesGallery',
    component: () => import('@/views/templates/TemplatesGalleryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/templates/my',
    name: 'MyTemplates',
    component: () => import('@/views/templates/MyTemplatesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/templates/new',
    name: 'TemplateBuilder',
    component: () => import('@/views/templates/TemplateBuilderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/templates/:id/edit',
    name: 'TemplateBuilderEdit',
    component: () => import('@/views/templates/TemplateBuilderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('@/views/documents/DocumentsView.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
