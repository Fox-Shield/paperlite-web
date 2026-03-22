<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'

const authStore = useAuthStore()
</script>

<template>
    <div class="flex h-screen bg-gray-50">
        <AppSidebar />

        <!-- Main content -->
        <div class="flex-1 overflow-auto">
            <main class="max-w-4xl mx-auto px-6 py-10">
                <h2 class="text-xl font-semibold text-gray-900 mb-1">
                    Welcome to PaperLite, {{ authStore.user?.firstName }}
                </h2>
                <p class="text-sm text-gray-500 mb-8">
                    Manage your documents and workspaces.
                </p>

                <!-- Workspaces section -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 class="text-sm font-semibold text-gray-700 mb-4">
                        Your Workspaces
                    </h3>
                    <div
                        class="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <div
                            class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3"
                        >
                            <svg
                                class="w-6 h-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                />
                            </svg>
                        </div>
                        <p class="text-sm font-medium text-gray-700">No workspaces yet</p>
                        <p class="text-xs text-gray-400 mt-1">Create one to get started.</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>
