<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApprovalsStore } from '@/stores/approvals'
import { useAuthStore } from '@/stores/auth'
import type { DocumentApprovalStatus } from '@/types/generation'
import type { ApprovalDecision } from '@/types/approval'

const props = defineProps<{
    documentId: number
    approvalStatus: DocumentApprovalStatus
}>()

const emit = defineEmits<{ viewRequest: []; statusChanged: [] }>()

const approvalsStore = useApprovalsStore()
const authStore = useAuthStore()

const reviewComment = ref('')
const isSubmitting = ref(false)
const showReviewInput = ref(false)
const pendingDecision = ref<ApprovalDecision | null>(null)

const latestRequest = computed(
    () => approvalsStore.requests[approvalsStore.requests.length - 1] ?? null
)

const pendingReviewCount = computed(
    () => latestRequest.value?.reviews.filter((r) => r.decision === null).length ?? 0
)

const isRequester = computed(
    () => latestRequest.value?.requestedBy.id === authStore.user?.id
)

const myPendingReview = computed(() => {
    if (!latestRequest.value) return null
    return (
        approvalsStore.pendingReviews.find((r) => r.id === latestRequest.value!.id) ??
        null
    )
})

async function handleWithdraw(): Promise<void> {
    if (!latestRequest.value) return
    await approvalsStore.withdraw(props.documentId, latestRequest.value.id)
    emit('statusChanged')
}

function startReview(decision: ApprovalDecision): void {
    pendingDecision.value = decision
    showReviewInput.value = true
}

async function submitReview(): Promise<void> {
    if (!latestRequest.value || !pendingDecision.value) return
    isSubmitting.value = true
    try {
        await approvalsStore.submitReview(props.documentId, latestRequest.value.id, {
            decision: pendingDecision.value,
            comment: reviewComment.value.trim() || undefined
        })
        showReviewInput.value = false
        reviewComment.value = ''
        pendingDecision.value = null
        emit('statusChanged')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <!-- PENDING_APPROVAL bar -->
    <div
        v-if="props.approvalStatus === 'PENDING_APPROVAL'"
        class="bg-amber-50 border-b border-amber-200 px-4 py-2.5 shrink-0"
    >
        <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div>
                <span class="text-sm font-medium text-amber-800">
                    Awaiting approval
                </span>
                <span v-if="pendingReviewCount > 0" class="text-sm text-amber-600 ml-1">
                    from {{ pendingReviewCount }} reviewer(s)
                </span>
            </div>
            <div class="flex items-center gap-2">
                <!-- Reviewer actions -->
                <template v-if="myPendingReview && !showReviewInput">
                    <span class="text-xs text-amber-700 mr-1">
                        Your review is requested
                    </span>
                    <button
                        @click="startReview('APPROVED')"
                        class="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                        Approve
                    </button>
                    <button
                        @click="startReview('REJECTED')"
                        class="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                        Reject
                    </button>
                </template>
                <!-- Requester withdraw -->
                <button
                    v-if="isRequester"
                    @click="handleWithdraw"
                    class="px-3 py-1 rounded-lg border border-amber-300 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                    Withdraw
                </button>
            </div>
        </div>
        <!-- Inline review comment -->
        <div v-if="showReviewInput" class="max-w-7xl mx-auto mt-2 flex items-start gap-2">
            <input
                v-model="reviewComment"
                type="text"
                placeholder="Add a comment (optional)…"
                class="flex-1 rounded-lg border border-amber-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
                @click="submitReview"
                :disabled="isSubmitting"
                class="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
                {{
                    isSubmitting
                        ? 'Submitting…'
                        : pendingDecision === 'APPROVED'
                          ? 'Confirm Approve'
                          : 'Confirm Reject'
                }}
            </button>
            <button
                @click="showReviewInput = false"
                class="text-xs text-amber-600 hover:text-amber-900 px-2"
            >
                Cancel
            </button>
        </div>
    </div>

    <!-- APPROVED bar -->
    <div
        v-else-if="props.approvalStatus === 'APPROVED'"
        class="bg-green-50 border-b border-green-200 px-4 py-2.5 shrink-0"
    >
        <div class="max-w-7xl mx-auto flex items-center gap-2">
            <svg
                class="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                />
            </svg>
            <span class="text-sm font-medium text-green-800">Approved</span>
            <button
                @click="emit('viewRequest')"
                class="text-xs text-green-600 hover:underline ml-1"
            >
                View details
            </button>
        </div>
    </div>

    <!-- REJECTED bar -->
    <div
        v-else-if="props.approvalStatus === 'REJECTED'"
        class="bg-red-50 border-b border-red-200 px-4 py-2.5 shrink-0"
    >
        <div class="max-w-7xl mx-auto flex items-center gap-2">
            <svg
                class="w-4 h-4 text-red-600"
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
            <span class="text-sm font-medium text-red-800">Rejected</span>
            <button
                @click="emit('viewRequest')"
                class="text-xs text-red-600 hover:underline ml-1"
            >
                View feedback
            </button>
        </div>
    </div>
</template>
