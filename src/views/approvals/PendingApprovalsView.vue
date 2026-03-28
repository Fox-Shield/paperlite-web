<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApprovalsStore } from '@/stores/approvals'

const router = useRouter()
const approvalsStore = useApprovalsStore()

const pendingReviews = computed(() => approvalsStore.pendingReviews)

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function goToDocument(documentId: number): void {
    router.push({ name: 'document-detail', params: { id: documentId } })
}

onMounted(() => approvalsStore.fetchPendingReviews().catch(() => {}))
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="max-w-3xl mx-auto px-4 py-8">
            <h1 class="text-xl font-semibold text-gray-900 mb-6">Pending Approvals</h1>

            <div v-if="approvalsStore.loading" class="space-y-3">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
            </div>

            <div
                v-else-if="pendingReviews.length === 0"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center"
            >
                <svg
                    class="w-8 h-8 mx-auto mb-3 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p class="text-sm text-gray-500">
                    No pending reviews. You're all caught up!
                </p>
            </div>

            <div v-else class="space-y-3">
                <button
                    v-for="request in pendingReviews"
                    :key="request.id"
                    class="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-gray-300 transition-colors"
                    @click="goToDocument(request.documentId)"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="text-sm font-semibold text-gray-900 truncate">
                                {{ request.documentTitle }}
                            </p>
                            <p class="text-xs text-gray-500 mt-0.5">
                                Requested by
                                {{ request.requestedBy.name }}
                                &middot;
                                {{ formatDate(request.createdAt) }}
                            </p>
                            <p
                                v-if="request.message"
                                class="text-xs text-gray-600 mt-1 line-clamp-2"
                            >
                                {{ request.message }}
                            </p>
                        </div>
                        <span
                            class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0"
                        >
                            Pending
                        </span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
