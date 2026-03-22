import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FieldValue, GenerationRequest, SaveFieldValuesRequest } from '@/types/generation'
import generationApi from '@/services/generationApi'

export const useGenerationStore = defineStore('generation', () => {
    const fieldValues = ref<FieldValue[]>([])
    const generationRequest = ref<GenerationRequest | null>(null)
    const isGenerating = ref(false)
    const pollingInterval = ref<number | null>(null)

    // Debounce timer for auto-save
    let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null

    async function fetchFieldValues(documentId: number): Promise<void> {
        const data = await generationApi.getFieldValues(documentId)
        fieldValues.value = data
    }

    async function saveFieldValues(
        documentId: number,
        values: SaveFieldValuesRequest,
    ): Promise<void> {
        await generationApi.saveFieldValues(documentId, values)
    }

    function scheduleSave(documentId: number, values: SaveFieldValuesRequest): void {
        if (saveDebounceTimer !== null) {
            clearTimeout(saveDebounceTimer)
        }
        saveDebounceTimer = setTimeout(() => {
            saveFieldValues(documentId, values)
            saveDebounceTimer = null
        }, 1500)
    }

    async function generateDocument(documentId: number): Promise<void> {
        isGenerating.value = true
        generationRequest.value = null
        try {
            const request = await generationApi.generateDocument(documentId)
            generationRequest.value = request
            startPolling(documentId, request.id)
        } catch (err) {
            isGenerating.value = false
            throw err
        }
    }

    function startPolling(documentId: number, requestId: number): void {
        stopPolling()
        pollingInterval.value = window.setInterval(async () => {
            await pollStatus(documentId, requestId)
        }, 2000)
    }

    async function pollStatus(documentId: number, requestId: number): Promise<void> {
        try {
            const status = await generationApi.getGenerationStatus(documentId, requestId)
            generationRequest.value = status
            if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                stopPolling()
                isGenerating.value = false
            }
        } catch {
            stopPolling()
            isGenerating.value = false
        }
    }

    function stopPolling(): void {
        if (pollingInterval.value !== null) {
            clearInterval(pollingInterval.value)
            pollingInterval.value = null
        }
    }

    async function downloadPdf(documentId: number, requestId: number): Promise<void> {
        const blob = await generationApi.downloadPdf(documentId, requestId)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `document-${documentId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    function reset(): void {
        stopPolling()
        fieldValues.value = []
        generationRequest.value = null
        isGenerating.value = false
    }

    return {
        fieldValues,
        generationRequest,
        isGenerating,
        pollingInterval,
        fetchFieldValues,
        saveFieldValues,
        scheduleSave,
        generateDocument,
        pollStatus,
        stopPolling,
        downloadPdf,
        reset,
    }
})
