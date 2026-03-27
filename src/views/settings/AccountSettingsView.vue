<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const showDeleteModal = ref(false)
const deleteConfirmText = ref('')

function handleDeleteAccount(): void {
    // Placeholder — real implementation would call an API endpoint
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="max-w-lg space-y-8">
        <!-- Profile -->
        <section>
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
            <div class="space-y-3">
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1"
                        >Name</label
                    >
                    <p class="text-sm text-gray-900">
                        {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                    </p>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1"
                        >Email</label
                    >
                    <p class="text-sm text-gray-900">{{ authStore.user?.email }}</p>
                </div>
            </div>
        </section>

        <!-- Password -->
        <section>
            <h2 class="text-sm font-semibold text-gray-900 mb-4">Security</h2>
            <button
                class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                @click="() => {}"
            >
                Change password
            </button>
        </section>

        <!-- Danger zone -->
        <section class="border border-red-200 rounded-lg p-4">
            <h2 class="text-sm font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p class="text-xs text-gray-500 mb-3">
                Permanently delete your account and all associated data. This action
                cannot be undone.
            </p>
            <button
                class="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                @click="showDeleteModal = true"
            >
                Delete account
            </button>
        </section>

        <!-- Delete confirmation modal -->
        <div
            v-if="showDeleteModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            @click.self="showDeleteModal = false"
        >
            <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 class="text-base font-semibold text-gray-900 mb-2">
                    Delete account?
                </h3>
                <p class="text-sm text-gray-500 mb-4">
                    This will permanently delete all your data. Type
                    <strong>delete</strong> to confirm.
                </p>
                <input
                    v-model="deleteConfirmText"
                    type="text"
                    placeholder="delete"
                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                <div class="flex justify-end gap-2">
                    <button
                        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                        @click="showDeleteModal = false"
                    >
                        Cancel
                    </button>
                    <button
                        class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        :disabled="deleteConfirmText !== 'delete'"
                        @click="handleDeleteAccount"
                    >
                        Delete account
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
