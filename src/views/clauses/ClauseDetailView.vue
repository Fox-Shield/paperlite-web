<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClausesStore } from '@/stores/clauses'
import { useAuthStore } from '@/stores/auth'
import { clausesApi } from '@/services/api'
import api from '@/services/api'
import type { Template } from '@/types/template'

const route = useRoute()
const router = useRouter()
const store = useClausesStore()
const authStore = useAuthStore()

const id = route.params.id as string

// Insert into template modal
const showInsertModal = ref(false)
const templates = ref<Template[]>([])
const selectedTemplateId = ref('')
const sectionName = ref('')
const inserting = ref(false)
const insertError = ref('')
const insertSuccess = ref(false)

const deleting = ref(false)
const error = ref('')

onMounted(async () => {
    await store.fetchClause(id)
})

async function loadTemplates(): Promise<void> {
    if (templates.value.length > 0) return
    try {
        const { data } = await api.get<Template[]>('/templates')
        templates.value = data
    } catch {
        // silently ignore — user will see empty select
    }
}

function openInsertModal(): void {
    showInsertModal.value = true
    loadTemplates()
}

async function insertIntoTemplate(): Promise<void> {
    if (!selectedTemplateId.value || !sectionName.value.trim()) {
        insertError.value = 'Please select a template and enter a section name.'
        return
    }
    insertError.value = ''
    inserting.value = true
    try {
        await clausesApi.addToTemplate(selectedTemplateId.value, {
            clauseId: id,
            sectionName: sectionName.value.trim(),
            sortOrder: 0
        })
        insertSuccess.value = true
        setTimeout(() => {
            showInsertModal.value = false
            insertSuccess.value = false
            selectedTemplateId.value = ''
            sectionName.value = ''
        }, 1500)
    } catch {
        insertError.value = 'Failed to insert clause into template.'
    } finally {
        inserting.value = false
    }
}

async function handleDelete(): Promise<void> {
    if (!confirm(`Delete "${store.currentClause?.title}"? This cannot be undone.`)) return
    deleting.value = true
    try {
        await store.deleteClause(id)
        router.push('/clause-library')
    } catch {
        error.value = 'Failed to delete clause.'
        deleting.value = false
    }
}

const categoryColors: Record<string, string> = {
    Contract: 'bg-blue-50 text-blue-700',
    NDA: 'bg-purple-50 text-purple-700',
    Employment: 'bg-green-50 text-green-700',
    Liability: 'bg-red-50 text-red-700',
    IP: 'bg-amber-50 text-amber-700',
    Confidentiality: 'bg-indigo-50 text-indigo-700',
    Payment: 'bg-teal-50 text-teal-700',
    Termination: 'bg-orange-50 text-orange-700'
}

function categoryColor(cat: string): string {
    return categoryColors[cat] ?? 'bg-gray-100 text-gray-600'
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <button
                        class="text-gray-400 hover:text-gray-900 transition-colors"
                        @click="router.push('/clause-library')"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <h1 class="text-sm font-semibold text-gray-900">
                        {{ store.currentClause?.title ?? 'Clause' }}
                    </h1>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        class="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        @click="openInsertModal"
                    >
                        Insert into Template
                    </button>
                    <router-link
                        v-if="store.currentClause?.createdBy === authStore.user?.id"
                        :to="`/clause-library/${id}/edit`"
                        class="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Edit
                    </router-link>
                </div>
            </div>
        </header>

        <!-- Loading -->
        <main class="max-w-4xl mx-auto px-6 py-8">
            <p v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</p>

            <div v-if="!store.currentClause" class="space-y-4">
                <div
                    class="h-8 w-64 bg-white rounded-lg border border-gray-100 animate-pulse"
                />
                <div
                    class="h-48 bg-white rounded-xl border border-gray-100 animate-pulse"
                />
            </div>

            <div v-else class="flex flex-col gap-6">
                <!-- Metadata -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 class="text-base font-semibold text-gray-900 mb-1">
                                {{ store.currentClause.title }}
                            </h2>
                            <p
                                v-if="store.currentClause.description"
                                class="text-sm text-gray-500"
                            >
                                {{ store.currentClause.description }}
                            </p>
                        </div>
                        <span
                            class="shrink-0 text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5"
                        >
                            v{{ store.currentClause.version }}
                        </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 mb-4">
                        <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="categoryColor(store.currentClause.category)"
                        >
                            {{ store.currentClause.category }}
                        </span>
                        <span
                            v-if="store.currentClause.isPublic"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100"
                        >
                            Public
                        </span>
                        <span
                            v-for="tag in store.currentClause.tags"
                            :key="tag"
                            class="px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500 border border-gray-100"
                        >
                            {{ tag }}
                        </span>
                    </div>

                    <div
                        class="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3"
                    >
                        <span
                            >Created
                            {{
                                new Date(
                                    store.currentClause.createdAt
                                ).toLocaleDateString()
                            }}</span
                        >
                        <span
                            >Updated
                            {{
                                new Date(
                                    store.currentClause.updatedAt
                                ).toLocaleDateString()
                            }}</span
                        >
                    </div>
                </div>

                <!-- Content -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <p
                        class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4"
                    >
                        Clause Text
                    </p>
                    <div
                        class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif"
                    >
                        {{ store.currentClause.content }}
                    </div>
                </div>

                <!-- Danger zone -->
                <div
                    v-if="store.currentClause.createdBy === authStore.user?.id"
                    class="flex justify-end"
                >
                    <button
                        :disabled="deleting"
                        class="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        @click="handleDelete"
                    >
                        {{ deleting ? 'Deleting…' : 'Delete clause' }}
                    </button>
                </div>
            </div>
        </main>

        <!-- Insert into Template Modal -->
        <div
            v-if="showInsertModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            @click.self="showInsertModal = false"
        >
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div
                    class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
                >
                    <p class="text-sm font-semibold text-gray-900">
                        Insert into Template
                    </p>
                    <button
                        class="text-gray-400 hover:text-gray-900 transition-colors"
                        @click="showInsertModal = false"
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

                <div class="px-6 py-5 flex flex-col gap-4">
                    <div
                        v-if="insertSuccess"
                        class="text-sm text-green-600 font-medium text-center py-2"
                    >
                        Clause inserted successfully!
                    </div>

                    <template v-else>
                        <p v-if="insertError" class="text-sm text-red-500">
                            {{ insertError }}
                        </p>

                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">
                                Template
                            </label>
                            <select
                                v-model="selectedTemplateId"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            >
                                <option value="">Select a template…</option>
                                <option v-for="t in templates" :key="t.id" :value="t.id">
                                    {{ t.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">
                                Section Name
                            </label>
                            <input
                                v-model="sectionName"
                                type="text"
                                placeholder="e.g. Liability Clauses"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                        </div>

                        <button
                            :disabled="inserting"
                            class="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            @click="insertIntoTemplate"
                        >
                            {{ inserting ? 'Inserting…' : 'Insert Clause' }}
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
