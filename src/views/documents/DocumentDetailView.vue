<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGenerationStore } from '@/stores/generation'
import GenerationStatusBanner from '@/components/GenerationStatusBanner.vue'
import api from '@/services/api'
import type { Document, FieldValue } from '@/types/generation'

const route = useRoute()
const router = useRouter()
const generationStore = useGenerationStore()

const documentId = computed(() => Number(route.params.id))

const document = ref<Document | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const showAutoSave = ref(false)
const errors = ref<Record<number, string>>({})
const localValues = ref<Record<number, string>>({})

async function loadDocument(): Promise<void> {
    isLoading.value = true
    try {
        const { data } = await api.get<Document>(`/documents/${documentId.value}`)
        document.value = data
    } finally {
        isLoading.value = false
    }
}

async function loadFieldValues(): Promise<void> {
    await generationStore.fetchFieldValues(documentId.value)
    // Seed local values from store
    localValues.value = {}
    for (const fv of generationStore.fieldValues) {
        localValues.value[fv.templateFieldId] = fv.value ?? ''
    }
}

function getError(fieldId: number): string {
    return errors.value[fieldId] ?? ''
}

function validateField(fv: FieldValue): boolean {
    const val = localValues.value[fv.templateFieldId] ?? ''
    if (fv.required && !val.trim()) {
        errors.value[fv.templateFieldId] = `${fv.fieldName} is required.`
        return false
    }
    if (fv.fieldType === 'NUMBER' && val && isNaN(Number(val))) {
        errors.value[fv.templateFieldId] = 'Must be a valid number.'
        return false
    }
    delete errors.value[fv.templateFieldId]
    return true
}

function validateAll(): boolean {
    let valid = true
    for (const fv of generationStore.fieldValues) {
        if (!validateField(fv)) valid = false
    }
    return valid
}

function buildSavePayload() {
    return {
        fieldValues: generationStore.fieldValues.map((fv) => ({
            templateFieldId: fv.templateFieldId,
            value: localValues.value[fv.templateFieldId] ?? '',
        })),
    }
}

function onFieldChange(fv: FieldValue): void {
    validateField(fv)
    // Trigger debounced auto-save
    generationStore.scheduleSave(documentId.value, buildSavePayload())
    showAutoSave.value = true
}

// Hide "Auto-saving..." after store finishes (simple approach: 2s timeout)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
watch(
    () => generationStore.fieldValues,
    () => {
        if (autoSaveTimer !== null) clearTimeout(autoSaveTimer)
        autoSaveTimer = setTimeout(() => {
            showAutoSave.value = false
        }, 2000)
    },
)

async function handleSaveDraft(): Promise<void> {
    isSaving.value = true
    try {
        await generationStore.saveFieldValues(documentId.value, buildSavePayload())
    } finally {
        isSaving.value = false
    }
}

async function handleGenerate(): Promise<void> {
    if (!validateAll()) return
    await generationStore.saveFieldValues(documentId.value, buildSavePayload())
    await generationStore.generateDocument(documentId.value)
}

function handleDownload(): void {
    if (!generationStore.generationRequest) return
    generationStore.downloadPdf(documentId.value, generationStore.generationRequest.id)
}

function handleRetry(): void {
    generationStore.generateDocument(documentId.value)
}

function goBack(): void {
    router.push({ name: 'documents' })
}

onMounted(async () => {
    generationStore.reset()
    await Promise.all([loadDocument(), loadFieldValues()])
})

onUnmounted(() => {
    generationStore.stopPolling()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 shrink-0">
            <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
                <button
                    @click="goBack"
                    class="text-sm text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Documents
                </button>
                <span class="text-gray-300">/</span>
                <span class="text-sm font-semibold text-gray-900">
                    {{ document?.name ?? 'Loading…' }}
                </span>
                <span
                    v-if="showAutoSave"
                    class="ml-auto text-xs text-gray-400 animate-pulse"
                >
                    Auto-saving…
                </span>
            </div>
        </header>

        <!-- Generation status banner -->
        <GenerationStatusBanner
            v-if="generationStore.generationRequest"
            :request="generationStore.generationRequest"
            :is-generating="generationStore.isGenerating"
            @download="handleDownload"
            @retry="handleRetry"
        />

        <!-- Two-panel layout -->
        <div
            v-if="!isLoading"
            class="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6"
        >
            <!-- Left panel — field form (40%) -->
            <div class="w-2/5 shrink-0">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 class="text-sm font-semibold text-gray-700 mb-5">Fill in fields</h2>

                    <div
                        v-if="generationStore.fieldValues.length === 0"
                        class="text-xs text-gray-400 py-6 text-center"
                    >
                        No fields for this template.
                    </div>

                    <div v-else class="space-y-4">
                        <div
                            v-for="fv in generationStore.fieldValues"
                            :key="fv.templateFieldId"
                        >
                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                {{ fv.fieldName }}
                                <span v-if="fv.required" class="text-red-400 ml-0.5">*</span>
                            </label>

                            <!-- TEXT -->
                            <input
                                v-if="fv.fieldType === 'TEXT'"
                                v-model="localValues[fv.templateFieldId]"
                                type="text"
                                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                :class="getError(fv.templateFieldId) ? 'border-red-300' : 'border-gray-200'"
                                @input="onFieldChange(fv)"
                            />

                            <!-- NUMBER -->
                            <input
                                v-else-if="fv.fieldType === 'NUMBER'"
                                v-model="localValues[fv.templateFieldId]"
                                type="number"
                                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                :class="getError(fv.templateFieldId) ? 'border-red-300' : 'border-gray-200'"
                                @input="onFieldChange(fv)"
                            />

                            <!-- DATE -->
                            <input
                                v-else-if="fv.fieldType === 'DATE'"
                                v-model="localValues[fv.templateFieldId]"
                                type="date"
                                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                :class="getError(fv.templateFieldId) ? 'border-red-300' : 'border-gray-200'"
                                @change="onFieldChange(fv)"
                            />

                            <!-- BOOLEAN -->
                            <div
                                v-else-if="fv.fieldType === 'BOOLEAN'"
                                class="flex items-center gap-2"
                            >
                                <input
                                    :id="`field-${fv.templateFieldId}`"
                                    v-model="localValues[fv.templateFieldId]"
                                    type="checkbox"
                                    true-value="true"
                                    false-value="false"
                                    class="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                    @change="onFieldChange(fv)"
                                />
                                <label
                                    :for="`field-${fv.templateFieldId}`"
                                    class="text-sm text-gray-600"
                                >
                                    {{ fv.fieldName }}
                                </label>
                            </div>

                            <!-- TEXTAREA -->
                            <textarea
                                v-else-if="fv.fieldType === 'TEXTAREA'"
                                v-model="localValues[fv.templateFieldId]"
                                rows="3"
                                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                :class="getError(fv.templateFieldId) ? 'border-red-300' : 'border-gray-200'"
                                @input="onFieldChange(fv)"
                            />

                            <!-- SELECT -->
                            <select
                                v-else-if="fv.fieldType === 'SELECT'"
                                v-model="localValues[fv.templateFieldId]"
                                class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                :class="getError(fv.templateFieldId) ? 'border-red-300' : 'border-gray-200'"
                                @change="onFieldChange(fv)"
                            >
                                <option value="" disabled>Select…</option>
                                <option v-for="opt in fv.options" :key="opt" :value="opt">
                                    {{ opt }}
                                </option>
                            </select>

                            <p
                                v-if="getError(fv.templateFieldId)"
                                class="mt-1 text-xs text-red-500"
                            >
                                {{ getError(fv.templateFieldId) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right panel — live preview (60%) -->
            <div class="flex-1">
                <div
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full"
                >
                    <h2 class="text-sm font-semibold text-gray-700 mb-5">Preview</h2>

                    <div
                        v-if="generationStore.fieldValues.length === 0"
                        class="flex flex-col items-center justify-center h-48 text-gray-400"
                    >
                        <svg
                            class="w-8 h-8 mb-2 opacity-40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p class="text-xs">No fields to preview.</p>
                    </div>

                    <div
                        v-else
                        class="border border-dashed border-gray-200 rounded-xl p-5 space-y-3"
                    >
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-6 h-6 rounded bg-gray-900 flex items-center justify-center">
                                <svg
                                    class="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <span class="text-sm font-semibold text-gray-800">
                                {{ document?.name ?? 'Document Preview' }}
                            </span>
                        </div>

                        <div
                            v-for="fv in generationStore.fieldValues"
                            :key="fv.templateFieldId"
                            class="flex items-baseline gap-2 py-1.5 border-b border-gray-50 last:border-0"
                        >
                            <span class="text-xs font-medium text-gray-500 w-32 shrink-0">
                                {{ fv.fieldName }}
                            </span>
                            <span
                                class="text-sm text-gray-900"
                                :class="{
                                    'text-gray-300 italic': !localValues[fv.templateFieldId],
                                }"
                            >
                                {{
                                    localValues[fv.templateFieldId] || '—'
                                }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading skeleton -->
        <div v-else class="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
            <div class="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        </div>

        <!-- Bottom action bar -->
        <footer class="bg-white border-t border-gray-200 shrink-0">
            <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-end gap-3">
                <button
                    @click="handleSaveDraft"
                    :disabled="isSaving"
                    class="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                    {{ isSaving ? 'Saving…' : 'Save Draft' }}
                </button>
                <button
                    @click="handleGenerate"
                    :disabled="generationStore.isGenerating"
                    class="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ generationStore.isGenerating ? 'Generating…' : 'Generate PDF' }}
                </button>
            </div>
        </footer>
    </div>
</template>
