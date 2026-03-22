import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
        requiresGuest?: boolean
    }
}

const routes: RouteRecordRaw[] = [
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
        path: '/documents',
        name: 'documents',
        component: () => import('@/views/documents/DocumentsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/documents/:id',
        name: 'document-detail',
        component: () => import('@/views/documents/DocumentDetailView.vue'),
        meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
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
