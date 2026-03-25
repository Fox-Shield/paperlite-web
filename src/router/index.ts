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
        name: 'documents',
        component: () => import('@/views/documents/DocumentsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/documents/shared-with-me',
        name: 'shared-with-me',
        component: () => import('@/views/documents/SharedWithMeView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/documents/:id',
        name: 'document-detail',
        component: () => import('@/views/documents/DocumentDetailView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/intake-forms',
        name: 'IntakeForms',
        component: () => import('@/views/intake/IntakeFormsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/intake-forms/new',
        name: 'IntakeFormBuilder',
        component: () => import('@/views/intake/IntakeFormBuilderView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/intake-forms/:id/edit',
        name: 'IntakeFormBuilderEdit',
        component: () => import('@/views/intake/IntakeFormBuilderView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/intake-forms/:id/submissions',
        name: 'IntakeFormSubmissions',
        component: () => import('@/views/intake/IntakeFormSubmissionsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/forms/:formId',
        name: 'PublicIntakeForm',
        component: () => import('@/views/intake/PublicIntakeFormView.vue')
    },
    {
        path: '/clause-library',
        name: 'clause-library',
        component: () => import('@/views/clauses/ClauseLibraryView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/clause-library/new',
        name: 'clause-new',
        component: () => import('@/views/clauses/ClauseEditorView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/clause-library/:id/edit',
        name: 'clause-edit',
        component: () => import('@/views/clauses/ClauseEditorView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/clause-library/:id',
        name: 'clause-detail',
        component: () => import('@/views/clauses/ClauseDetailView.vue'),
        meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
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
