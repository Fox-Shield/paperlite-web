<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Nav -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <RouterLink to="/dashboard" class="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
          PaperLite
        </RouterLink>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
          <button
            @click="handleLogout"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="max-w-5xl mx-auto px-4 py-10">
      <p class="text-sm text-gray-400">Workspace {{ route.params.id }} — coming soon</p>
    </main>
  </div>
</template>
