import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { documentsApi } from '@/services/api'
import type { Document, CreateDocumentRequest, UpdateDocumentRequest } from '@/types'
import type { DocumentVersion } from '@/types/document'

export const useDocumentsStore = defineStore('documents', () => {
    const documents = ref<Document[]>([])
    const loading = ref(false)
    const versions = ref<DocumentVersion[]>([])
    const versionsLoading = ref(false)

    async function fetchDocuments(workspaceId: string): Promise<Document[]> {
        loading.value = true
        try {
            const { data } = await api.get<Document[]>(`/workspaces/${workspaceId}/documents`)
            documents.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    async function createDocument(payload: CreateDocumentRequest): Promise<Document> {
        const { data } = await api.post<Document>('/documents', payload)
        documents.value.push(data)
        return data
    }

    async function updateDocument(id: string, payload: UpdateDocumentRequest): Promise<Document> {
        const { data } = await api.patch<Document>(`/documents/${id}`, payload)
        const index = documents.value.findIndex((d) => d.id === id)
        if (index !== -1) documents.value[index] = data
        return data
    }

    async function deleteDocument(id: string): Promise<void> {
        await api.delete(`/documents/${id}`)
        documents.value = documents.value.filter((d) => d.id !== id)
    }

    async function fetchVersions(documentId: number): Promise<DocumentVersion[]> {
        versionsLoading.value = true
        try {
            const { data } = await documentsApi.getVersions(documentId)
            versions.value = data
            return data
        } finally {
            versionsLoading.value = false
        }
    }

    async function restoreVersion(documentId: number, versionId: number): Promise<void> {
        await documentsApi.restoreVersion(documentId, versionId)
        await fetchVersions(documentId)
    }

    return {
        documents,
        loading,
        versions,
        versionsLoading,
        fetchDocuments,
        createDocument,
        updateDocument,
        deleteDocument,
        fetchVersions,
        restoreVersion
    }
})
