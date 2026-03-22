<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import type {
    Document,
    Template,
    CreateDocumentRequest,
    DocumentStatus
} from '@/types/generation'

const router = useRouter()

const documents = ref<Document[]>([])
const templates = ref<Template[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const showNewModal = ref(false)

const newDocName = ref('')
const newDocTemplateId = ref<number | null>(null)
const createError = ref('')

const statusColors: Record<DocumentStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    READY: 'bg-green-100 text-green-700',
    ERROR: 'bg-red-100 text-red-600'
}

const statusLabels: Record<DocumentStatus, string> = {
    DRAFT: 'Draft',
    PROCESSING: 'Processing',
    READY: 'Ready',
    ERROR: 'Error'
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

async function loadDocuments(): Promise<void> {
    isLoading.value = true
    try {
        const { data } = await api.get<Document[]>('/documents')
        documents.value = data
    } finally {
        isLoading.value = false
    }
}

async function loadTemplates(): Promise<void> {
    try {
        const { data } = await api.get<Template[]>('/templates')
        templates.value = data
    } catch {
        // templates optional for modal
    }
}

async function handleCreate(): Promise<void> {
    if (!newDocName.value.trim() || !newDocTemplateId.value) {
        createError.value = 'Please enter a document name and select a template.'
        return
    }
    isCreating.value = true
    createError.value = ''
    try {
        const body: CreateDocumentRequest = {
            name: newDocName.value.trim(),
            templateId: newDocTemplateId.value
        }
        const { data } = await api.post<Document>('/documents', body)
        documents.value.unshift(data)
        closeModal()
        router.push({ name: 'document-detail', params: { id: data.id } })
    } catch {
        createError.value = 'Failed to create document. Please try again.'
    } finally {
        isCreating.value = false
    }
}

function openNewModal(): void {
    newDocName.value = ''
    newDocTemplateId.value = null
    createError.value = ''
    showNewModal.value = true
    loadTemplates()
}

function closeModal(): void {
    showNewModal.value = false
}

function goToDocument(id: number): void {
    router.push({ name: 'document-detail', params: { id } })
}

onMounted(loadDocuments)
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                <h1 class="text-base font-semibold text-gray-900">Documents</h1>
                <button
                    @click="openNewModal"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
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
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New Document
                </button>
            </div>
        </header>

        <main class="max-w-5xl mx-auto px-4 py-8">
            <!-- Loading -->
            <div v-if="isLoading" class="flex justify-center py-16">
                <svg
                    class="animate-spin w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                    />
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            </div>

            <!-- Empty state -->
            <div
                v-else-if="documents.length === 0"
                class="flex flex-col items-center justify-center py-20 text-center"
            >
                <div
                    class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"
                >
                    <svg
                        class="w-7 h-7 text-gray-400"
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
                </div>
                <p class="text-sm font-medium text-gray-700 mb-1">No documents yet</p>
                <p class="text-xs text-gray-400 mb-5">
                    Create your first document from a template.
                </p>
                <button
                    @click="openNewModal"
                    class="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                    New Document
                </button>
            </div>

            <!-- Document list -->
            <div
                v-else
                class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-100">
                            <th
                                class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                                Name
                            </th>
                            <th
                                class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                                Template
                            </th>
                            <th
                                class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                                Status
                            </th>
                            <th
                                class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                                Created
                            </th>
                            <th class="px-5 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="doc in documents"
                            :key="doc.id"
                            class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                            @click="goToDocument(doc.id)"
                        >
                            <td class="px-5 py-3.5 font-medium text-gray-900">
                                {{ doc.name }}
                            </td>
                            <td class="px-5 py-3.5 text-gray-500">
                                {{ doc.templateName }}
                            </td>
                            <td class="px-5 py-3.5">
                                <span
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="statusColors[doc.status]"
                                >
                                    {{ statusLabels[doc.status] }}
                                </span>
                            </td>
                            <td class="px-5 py-3.5 text-gray-400 text-xs">
                                {{ formatDate(doc.createdAt) }}
                            </td>
                            <td class="px-5 py-3.5 text-right" @click.stop>
                                <button
                                    @click="goToDocument(doc.id)"
                                    class="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Generate PDF →
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <!-- New Document Modal -->
        <Teleport to="body">
            <div
                v-if="showNewModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <!-- Backdrop -->
                <div
                    class="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    @click="closeModal"
                />
                <!-- Dialog -->
                <div
                    class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                    @click.stop
                >
                    <h2 class="text-base font-semibold text-gray-900 mb-5">
                        New Document
                    </h2>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                Document name
                            </label>
                            <input
                                v-model="newDocName"
                                type="text"
                                placeholder="e.g. Q4 Invoice"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                @keydown.enter="handleCreate"
                            />
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                Template
                            </label>
                            <select
                                v-model="newDocTemplateId"
                                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option :value="null" disabled>Select a template…</option>
                                <option
                                    v-for="tpl in templates"
                                    :key="tpl.id"
                                    :value="tpl.id"
                                >
                                    {{ tpl.name }}
                                </option>
                            </select>
                        </div>

                        <p v-if="createError" class="text-xs text-red-500">
                            {{ createError }}
                        </p>
                    </div>

                    <div class="mt-6 flex items-center justify-end gap-3">
                        <button
                            @click="closeModal"
                            class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            @click="handleCreate"
                            :disabled="isCreating"
                            class="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {{ isCreating ? 'Creating…' : 'Create' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
