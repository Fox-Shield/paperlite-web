import api from '@/services/api'
import type { FieldValue, GenerationRequest, SaveFieldValuesRequest } from '@/types/generation'

const generationApi = {
    async getFieldValues(documentId: number): Promise<FieldValue[]> {
        const { data } = await api.get<FieldValue[]>(`/documents/${documentId}/field-values`)
        return data
    },

    async saveFieldValues(documentId: number, req: SaveFieldValuesRequest): Promise<void> {
        await api.post(`/documents/${documentId}/field-values`, req)
    },

    async generateDocument(documentId: number): Promise<GenerationRequest> {
        const { data } = await api.post<GenerationRequest>(`/documents/${documentId}/generate`)
        return data
    },

    async getGenerationStatus(documentId: number, requestId: number): Promise<GenerationRequest> {
        const { data } = await api.get<GenerationRequest>(`/documents/${documentId}/generation/${requestId}/status`)
        return data
    },

    async downloadPdf(documentId: number, requestId: number): Promise<Blob> {
        const { data } = await api.get<Blob>(`/documents/${documentId}/generation/${requestId}/download`, {
            responseType: 'blob'
        })
        return data
    }
}

export default generationApi
