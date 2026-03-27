import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sharesApi } from '@/services/api'
import type { DocumentShare, DocumentWithShare, ShareDocumentRequest, SharePermission } from '@/types/collaboration'

export const useSharesStore = defineStore('shares', () => {
    const shares = ref<DocumentShare[]>([])
    const sharedWithMe = ref<DocumentWithShare[]>([])
    const loading = ref(false)

    async function fetchShares(documentId: string): Promise<void> {
        loading.value = true
        try {
            const { data } = await sharesApi.getShares(documentId)
            shares.value = data
        } finally {
            loading.value = false
        }
    }

    async function shareDocument(documentId: string, data: ShareDocumentRequest): Promise<void> {
        const { data: share } = await sharesApi.shareDocument(documentId, data)
        shares.value.push(share)
    }

    async function updatePermission(documentId: string, shareId: string, permission: SharePermission): Promise<void> {
        const { data: updated } = await sharesApi.updatePermission(documentId, shareId, permission)
        const index = shares.value.findIndex((s) => s.id === shareId)
        if (index !== -1) shares.value[index] = updated
    }

    async function revokeShare(documentId: string, shareId: string): Promise<void> {
        await sharesApi.revokeShare(documentId, shareId)
        shares.value = shares.value.filter((s) => s.id !== shareId)
    }

    async function fetchSharedWithMe(): Promise<void> {
        loading.value = true
        try {
            const { data } = await sharesApi.getSharedWithMe()
            sharedWithMe.value = data
        } finally {
            loading.value = false
        }
    }

    return {
        shares,
        sharedWithMe,
        loading,
        fetchShares,
        shareDocument,
        updatePermission,
        revokeShare,
        fetchSharedWithMe
    }
})
