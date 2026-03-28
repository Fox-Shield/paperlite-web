import { defineStore } from 'pinia'
import { ref } from 'vue'
import { approvalsApi } from '@/services/api'
import type { ApprovalRequest, CreateApprovalRequestDTO, SubmitReviewDTO } from '@/types/approval'

export const useApprovalsStore = defineStore('approvals', () => {
    const requests = ref<ApprovalRequest[]>([])
    const pendingReviews = ref<ApprovalRequest[]>([])
    const loading = ref(false)

    async function fetchForDocument(documentId: number): Promise<ApprovalRequest[]> {
        loading.value = true
        try {
            const { data } = await approvalsApi.getForDocument(documentId)
            requests.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    async function createRequest(documentId: number, data: CreateApprovalRequestDTO): Promise<ApprovalRequest> {
        const { data: created } = await approvalsApi.create(documentId, data)
        requests.value.push(created)
        return created
    }

    async function submitReview(
        documentId: number,
        requestId: number,
        data: SubmitReviewDTO
    ): Promise<ApprovalRequest> {
        const { data: updated } = await approvalsApi.submitReview(documentId, requestId, data)
        const idx = requests.value.findIndex((r) => r.id === requestId)
        if (idx !== -1) requests.value[idx] = updated
        const pidx = pendingReviews.value.findIndex((r) => r.id === requestId)
        if (pidx !== -1) pendingReviews.value.splice(pidx, 1)
        return updated
    }

    async function withdraw(documentId: number, requestId: number): Promise<void> {
        await approvalsApi.withdraw(documentId, requestId)
        requests.value = requests.value.filter((r) => r.id !== requestId)
    }

    async function fetchPendingReviews(): Promise<ApprovalRequest[]> {
        const { data } = await approvalsApi.getMyPending()
        pendingReviews.value = data
        return data
    }

    return {
        requests,
        pendingReviews,
        loading,
        fetchForDocument,
        createRequest,
        submitReview,
        withdraw,
        fetchPendingReviews
    }
})
