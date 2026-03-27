<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSharesStore } from '@/stores/shares'
import type { SharePermission } from '@/types/collaboration'

const props = defineProps<{ documentId: string }>()
const emit = defineEmits<{ close: [] }>()

const sharesStore = useSharesStore()

const email = ref('')
const permission = ref<SharePermission>('READ')
const errorMsg = ref('')
const isSharing = ref(false)

const permissionOptions: { value: SharePermission; label: string }[] = [
    { value: 'READ', label: 'Read' },
    { value: 'COMMENT', label: 'Comment' },
    { value: 'WRITE', label: 'Write' }
]

const permissionBadgeClass: Record<SharePermission, string> = {
    READ: 'bg-gray-100 text-gray-600',
    COMMENT: 'bg-blue-100 text-blue-700',
    WRITE: 'bg-green-100 text-green-700'
}

onMounted(() => sharesStore.fetchShares(props.documentId))

async function handleShare(): Promise<void> {
    errorMsg.value = ''
    if (!email.value.trim()) {
        errorMsg.value = 'Email is required.'
        return
    }
    isSharing.value = true
    try {
        await sharesStore.shareDocument(props.documentId, {
            email: email.value.trim(),
            permission: permission.value
        })
        email.value = ''
        permission.value = 'READ'
    } catch {
        errorMsg.value = 'Failed to share. Check the email and try again.'
    } finally {
        isSharing.value = false
    }
}

async function handleRevoke(shareId: string): Promise<void> {
    await sharesStore.revokeShare(props.documentId, shareId)
}
</script>

<template>
    <!-- Backdrop -->
    <div
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="emit('close')"
    >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-5">
                <h2 class="text-sm font-semibold text-gray-900">Share Document</h2>
                <button
                    @click="emit('close')"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <!-- Invite row -->
            <div class="flex gap-2 mb-2">
                <input
                    v-model="email"
                    type="email"
                    placeholder="Email address"
                    class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <select
                    v-model="permission"
                    class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                    <option
                        v-for="opt in permissionOptions"
                        :key="opt.value"
                        :value="opt.value"
                    >
                        {{ opt.label }}
                    </option>
                </select>
                <button
                    @click="handleShare"
                    :disabled="isSharing"
                    class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    {{ isSharing ? '…' : 'Share' }}
                </button>
            </div>
            <p v-if="errorMsg" class="text-xs text-red-500 mb-3">
                {{ errorMsg }}
            </p>

            <!-- Current shares -->
            <div
                v-if="sharesStore.shares.length > 0"
                class="mt-4 border-t border-gray-100 pt-4 space-y-3"
            >
                <p class="text-xs font-medium text-gray-500 mb-2">Shared with</p>
                <div
                    v-for="share in sharesStore.shares"
                    :key="share.id"
                    class="flex items-center gap-3"
                >
                    <!-- Avatar -->
                    <div
                        class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
                    >
                        <span class="text-xs font-medium text-gray-600">
                            {{ share.sharedWithUser.name.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate">
                            {{ share.sharedWithUser.name }}
                        </p>
                        <p class="text-xs text-gray-400 truncate">
                            {{ share.sharedWithUser.email }}
                        </p>
                    </div>
                    <span
                        class="text-xs font-medium px-2 py-0.5 rounded-full"
                        :class="permissionBadgeClass[share.permission]"
                    >
                        {{ share.permission }}
                    </span>
                    <button
                        @click="handleRevoke(share.id)"
                        class="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        title="Revoke access"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
