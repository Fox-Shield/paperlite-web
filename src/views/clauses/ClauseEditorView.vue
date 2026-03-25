<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClausesStore } from '@/stores/clauses'
import type { ClauseVersion } from '@/types/clause'

const route = useRoute()
const router = useRouter()
const store = useClausesStore()

const isEditing = computed(() => !!route.params.id)
const id = computed(() => route.params.id as string)

// Form fields
const title = ref('')
const category = ref('')
const description = ref('')
const content = ref('')
const isPublic = ref(false)
const changeNote = ref('')
const tagInput = ref('')
const tags = ref<string[]>([])

// Version history sidebar
const showVersionHistory = ref(false)
const selectedVersion = ref<ClauseVersion | null>(null)
const showVersionModal = ref(false)

const saving = ref(false)
const error = ref('')

onMounted(async () => {
    if (isEditing.value) {
        const clause = await store.fetchClause(id.value)
        if (clause) {
            title.value = clause.title
            category.value = clause.category
            description.value = clause.description ?? ''
            content.value = clause.content
            isPublic.value = clause.isPublic
            tags.value = [...clause.tags]
        }
    }
})

watch(showVersionHistory, async (open) => {
    if (open && isEditing.value && store.versions.length === 0) {
        await store.fetchVersions(id.value)
    }
})

function addTag(): void {
    const raw = tagInput.value.trim().replace(/,$/, '')
    if (raw && !tags.value.includes(raw)) tags.value.push(raw)
    tagInput.value = ''
}

function removeTag(tag: string): void {
    tags.value = tags.value.filter((t) => t !== tag)
}

function onTagKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag()
    }
}

function viewVersion(v: ClauseVersion): void {
    selectedVersion.value = v
    showVersionModal.value = true
}

async function save(): Promise<void> {
    if (!title.value.trim() || !category.value.trim() || !content.value.trim()) {
        error.value = 'Title, category, and content are required.'
        return
    }
    error.value = ''
    saving.value = true
    try {
        if (isEditing.value) {
            await store.updateClause(id.value, {
                title: title.value,
                category: category.value,
                description: description.value || undefined,
                content: content.value,
                isPublic: isPublic.value,
                tags: tags.value,
                changeNote: changeNote.value || undefined
            })
        } else {
            const clause = await store.createClause({
                title: title.value,
                category: category.value,
                description: description.value || undefined,
                content: content.value,
                isPublic: isPublic.value,
                tags: tags.value
            })
            router.push(`/clause-library/${clause.id}`)
            return
        }
        router.push(`/clause-library/${id.value}`)
    } catch {
        error.value = 'Failed to save clause.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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
                        {{ isEditing ? 'Edit Clause' : 'New Clause' }}
                    </h1>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        v-if="isEditing"
                        class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                        @click="showVersionHistory = !showVersionHistory"
                    >
                        History
                    </button>
                    <button
                        :disabled="saving"
                        class="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        @click="save"
                    >
                        {{ saving ? 'Saving…' : 'Save' }}
                    </button>
                </div>
            </div>
        </header>

        <div class="max-w-6xl mx-auto px-6 py-8 flex gap-6">
            <!-- Left: form -->
            <div class="flex-1 min-w-0 flex flex-col gap-4">
                <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

                <!-- Title -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        Title <span class="text-red-400">*</span>
                    </label>
                    <input
                        v-model="title"
                        type="text"
                        placeholder="e.g. Limitation of Liability"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        Category <span class="text-red-400">*</span>
                    </label>
                    <input
                        v-model="category"
                        type="text"
                        placeholder="e.g. Liability"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <input
                        v-model="description"
                        type="text"
                        placeholder="Brief description (optional)"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>

                <!-- Tags -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        Tags
                    </label>
                    <div class="flex flex-wrap gap-1.5 mb-2" v-if="tags.length > 0">
                        <span
                            v-for="tag in tags"
                            :key="tag"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                            {{ tag }}
                            <button
                                class="text-gray-400 hover:text-gray-900 leading-none"
                                @click="removeTag(tag)"
                            >
                                ×
                            </button>
                        </span>
                    </div>
                    <input
                        v-model="tagInput"
                        type="text"
                        placeholder="Type tag then press Enter or comma"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        @keydown="onTagKeydown"
                        @blur="addTag"
                    />
                </div>

                <!-- isPublic -->
                <div class="flex items-center gap-3">
                    <button
                        role="switch"
                        :aria-checked="isPublic"
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                        :class="isPublic ? 'bg-gray-900' : 'bg-gray-200'"
                        @click="isPublic = !isPublic"
                    >
                        <span
                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                            :class="isPublic ? 'translate-x-4' : 'translate-x-1'"
                        />
                    </button>
                    <span class="text-sm text-gray-700"> Public clause </span>
                </div>

                <!-- Content -->
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        Content <span class="text-red-400">*</span>
                    </label>
                    <textarea
                        v-model="content"
                        rows="14"
                        placeholder="Enter the clause text…"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y font-mono"
                    />
                </div>

                <!-- Change note (edit only) -->
                <div v-if="isEditing">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        Change Note
                    </label>
                    <input
                        v-model="changeNote"
                        type="text"
                        placeholder="Describe what changed (optional)"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>
            </div>

            <!-- Right: preview -->
            <div class="w-80 shrink-0 hidden lg:block">
                <div class="sticky top-8">
                    <p
                        class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide"
                    >
                        Preview
                    </p>
                    <div
                        class="bg-white rounded-xl border border-gray-100 p-4 min-h-48 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif"
                    >
                        <span v-if="content" class="text-gray-800">{{ content }}</span>
                        <span v-else class="text-gray-300 italic">
                            Clause content will appear here…
                        </span>
                    </div>
                </div>
            </div>

            <!-- Version history sidebar -->
            <div v-if="showVersionHistory && isEditing" class="w-72 shrink-0">
                <div class="sticky top-8">
                    <p
                        class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide"
                    >
                        Version History
                    </p>
                    <div
                        class="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden"
                    >
                        <div
                            v-if="store.versions.length === 0"
                            class="px-4 py-6 text-xs text-gray-400 text-center"
                        >
                            No previous versions
                        </div>
                        <button
                            v-for="v in store.versions"
                            :key="v.id"
                            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                            @click="viewVersion(v)"
                        >
                            <div class="flex items-center justify-between mb-0.5">
                                <span class="text-xs font-medium text-gray-900">
                                    v{{ v.versionNumber }}
                                </span>
                                <span class="text-xs text-gray-400">
                                    {{ new Date(v.createdAt).toLocaleDateString() }}
                                </span>
                            </div>
                            <p v-if="v.changeNote" class="text-xs text-gray-500 truncate">
                                {{ v.changeNote }}
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Version modal -->
        <div
            v-if="showVersionModal && selectedVersion"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            @click.self="showVersionModal = false"
        >
            <div
                class="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto"
            >
                <div
                    class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
                >
                    <div>
                        <p class="text-sm font-semibold text-gray-900">
                            Version {{ selectedVersion.versionNumber }}
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">
                            {{ new Date(selectedVersion.createdAt).toLocaleString() }}
                            <span v-if="selectedVersion.changeNote">
                                — {{ selectedVersion.changeNote }}
                            </span>
                        </p>
                    </div>
                    <button
                        class="text-gray-400 hover:text-gray-900 transition-colors"
                        @click="showVersionModal = false"
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
                <div class="px-6 py-4">
                    <pre
                        class="text-sm text-gray-800 whitespace-pre-wrap font-serif leading-relaxed"
                        >{{ selectedVersion.content }}</pre
                    >
                </div>
            </div>
        </div>
    </div>
</template>
