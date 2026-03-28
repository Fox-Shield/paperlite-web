<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import { useApprovalsStore } from '@/stores/approvals'
import PlanBadge from '@/components/PlanBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const approvalsStore = useApprovalsStore()
const mobileOpen = ref(false)

const planTier = computed(() => subscriptionStore.mySubscription?.plan.tier ?? 'FREE')
const pendingCount = computed(() => approvalsStore.pendingReviews.length)

onMounted(() => {
    subscriptionStore.fetchMySubscription().catch(() => {})
    approvalsStore.fetchPendingReviews().catch(() => {})
})

function handleLogout(): void {
    authStore.logout()
    router.push('/login')
}

function closeMobile(): void {
    mobileOpen.value = false
}
</script>

<template>
    <!-- Mobile hamburger button -->
    <button
        class="md:hidden fixed top-3 left-3 z-40 p-2 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none"
        @click="mobileOpen = !mobileOpen"
        :aria-expanded="mobileOpen"
        aria-controls="app-sidebar"
        aria-label="Toggle navigation"
    >
        <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
        >
            <path
                v-if="!mobileOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
            />
            <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    </button>

    <!-- Mobile backdrop -->
    <div
        v-if="mobileOpen"
        class="md:hidden fixed inset-0 z-30 bg-black/30"
        @click="closeMobile"
        aria-hidden="true"
    />

    <aside
        id="app-sidebar"
        class="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full fixed md:relative z-40 md:z-auto inset-y-0 left-0 transition-transform md:translate-x-0"
        :class="mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
        aria-label="Main navigation"
    >
        <!-- Logo -->
        <div class="h-14 flex items-center px-5 border-b border-gray-100">
            <span class="text-base font-semibold text-gray-900">PaperLite</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5" aria-label="Site navigation">
            <router-link
                to="/dashboard"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path === '/dashboard'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
                Dashboard
            </router-link>

            <router-link
                to="/documents"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path.startsWith('/documents') &&
                    $route.path !== '/documents/shared-with-me'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                Documents
            </router-link>

            <router-link
                to="/approvals/pending"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path === '/approvals/pending'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                Pending Approvals
                <span
                    v-if="pendingCount > 0"
                    class="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700"
                >
                    {{ pendingCount }}
                </span>
            </router-link>

            <router-link
                to="/templates"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path.startsWith('/templates') &&
                    $route.path !== '/templates/my'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                </svg>
                Template Gallery
            </router-link>

            <router-link
                to="/templates/my"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path === '/templates/my'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
                My Templates
            </router-link>

            <router-link
                to="/intake-forms"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path.startsWith('/intake-forms')
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                </svg>
                Intake Forms
            </router-link>

            <router-link
                to="/documents/shared-with-me"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path === '/documents/shared-with-me'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
                Shared with Me
            </router-link>

            <router-link
                to="/clause-library"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path.startsWith('/clause-library')
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                </svg>
                Clause Library
            </router-link>

            <router-link
                to="/settings/account"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                :class="
                    $route.path.startsWith('/settings')
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
                Settings
            </router-link>
        </nav>

        <!-- User / logout -->
        <div class="px-5 py-4 border-t border-gray-100">
            <div class="flex items-center justify-between">
                <div class="min-w-0">
                    <span class="text-xs text-gray-500 truncate block">
                        {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                    </span>
                    <PlanBadge :tier="planTier" class="mt-0.5" />
                </div>
                <button
                    @click="handleLogout"
                    class="text-xs text-gray-400 hover:text-gray-900 transition-colors ml-2 shrink-0 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none rounded"
                    aria-label="Sign out"
                >
                    Sign out
                </button>
            </div>
        </div>
    </aside>
</template>
