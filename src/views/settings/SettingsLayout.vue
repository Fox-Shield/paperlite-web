<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
    { label: 'Account', to: '/settings/account' },
    { label: 'Billing', to: '/settings/billing' },
    { label: 'Organization', to: '/settings/organization' },
    { label: 'Team', to: '/settings/team' }
]
</script>

<template>
    <div class="flex flex-col h-full">
        <div class="border-b border-gray-100 px-6 pt-6">
            <h1 class="text-lg font-semibold text-gray-900 mb-4">Settings</h1>
            <nav class="flex gap-1 -mb-px">
                <router-link
                    v-for="tab in tabs"
                    :key="tab.to"
                    :to="tab.to"
                    class="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
                    :class="
                        route.path === tab.to
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    "
                >
                    {{ tab.label }}
                </router-link>
            </nav>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-6">
            <router-view />
        </div>
    </div>
</template>
