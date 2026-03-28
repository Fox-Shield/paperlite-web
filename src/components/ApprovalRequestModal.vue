<script setup lang="ts">
import type { ApprovalRequest, ApprovalDecision } from '@/types/approval'

const props = defineProps<{ request: ApprovalRequest }>()
const emit = defineEmits<{ close: [] }>()

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

const decisionLabel: Record<ApprovalDecision, string> = {
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
}

const decisionClass: Record<ApprovalDecision, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700'
}

const statusClass: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-gray-100 text-gray-600'
}
</script>

<template>
    <div
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="emit('close')"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]"
        >
            <!-- Header -->
            <div
                class="flex items-start justify-between p-5 border-b border-gray-100 shrink-0"
            >
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-gray-900">
                            Approval Request
                        </span>
                        <span
                            class="text-xs font-medium px-2 py-0.5 rounded-full"
                            :class="statusClass[props.request.status]"
                        >
                            {{ props.request.status.replace('_', ' ') }}
                        </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">
                        Requested by {{ props.request.requestedBy.name }} &middot;
                        {{ formatDate(props.request.createdAt) }}
                    </p>
                </div>
                <button
                    @click="emit('close')"
                    class="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Close"
                >
                    <svg
                        class="w-5 h-5"
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

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-5 space-y-4">
                <!-- Message -->
                <div v-if="props.request.message" class="bg-gray-50 rounded-xl px-4 py-3">
                    <p class="text-xs font-medium text-gray-500 mb-1">Message</p>
                    <p class="text-sm text-gray-800">
                        {{ props.request.message }}
                    </p>
                </div>

                <!-- Reviews -->
                <div>
                    <p class="text-xs font-medium text-gray-500 mb-2">
                        Reviews
                        <span class="text-gray-400 font-normal ml-1">
                            ({{ props.request.reviews.length }})
                        </span>
                    </p>

                    <div
                        v-if="props.request.reviews.length === 0"
                        class="text-xs text-gray-400 text-center py-4"
                    >
                        No reviews yet.
                    </div>

                    <div class="space-y-3">
                        <div
                            v-for="review in props.request.reviews"
                            :key="review.id"
                            class="flex items-start gap-3"
                        >
                            <div
                                class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
                            >
                                <span class="text-xs font-medium text-gray-600">
                                    {{ review.reviewer.name.charAt(0).toUpperCase() }}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-baseline gap-2">
                                    <span class="text-xs font-semibold text-gray-800">
                                        {{ review.reviewer.name }}
                                    </span>
                                    <span
                                        class="text-xs font-medium px-1.5 py-0.5 rounded-full"
                                        :class="decisionClass[review.decision]"
                                    >
                                        {{ decisionLabel[review.decision] }}
                                    </span>
                                    <span class="text-xs text-gray-400">
                                        {{ formatDate(review.reviewedAt) }}
                                    </span>
                                </div>
                                <p
                                    v-if="review.comment"
                                    class="text-xs text-gray-600 mt-0.5"
                                >
                                    {{ review.comment }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end p-5 border-t border-gray-100 shrink-0">
                <button
                    @click="emit('close')"
                    class="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
