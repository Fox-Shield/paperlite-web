<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout(): void {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <aside class="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
        <!-- Logo -->
        <div class="h-14 flex items-center px-5 border-b border-gray-100">
            <span class="text-base font-semibold text-gray-900">PaperLite</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5">
            <router-link
                to="/dashboard"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                    $route.path === '/dashboard'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                    $route.path.startsWith('/documents')
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                to="/templates"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                    $route.path.startsWith('/templates') && $route.path !== '/templates/my'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                    $route.path === '/templates/my'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                "
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
                My Templates
            </router-link>
        </nav>

        <!-- User / logout -->
        <div class="px-5 py-4 border-t border-gray-100">
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 truncate">
                    {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </span>
                <button
                    @click="handleLogout"
                    class="text-xs text-gray-400 hover:text-gray-900 transition-colors ml-2 shrink-0"
                >
                    Sign out
                </button>
            </div>
        </div>
    </aside>
</template>
