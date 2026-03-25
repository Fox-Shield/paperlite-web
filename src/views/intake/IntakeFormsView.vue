<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIntakeFormsStore } from '@/stores/intakeForms'
import type { IntakeForm } from '@/types/intakeForm'

const router = useRouter()
const store = useIntakeFormsStore()

const copied = ref<number | null>(null)
const deleting = ref<number | null>(null)
const error = ref('')

onMounted(() => store.fetchForms())

function shareLink(form: IntakeForm): string {
    return `${window.location.origin}/forms/${form.id}`
}

async function copyLink(form: IntakeForm): Promise<void> {
    await navigator.clipboard.writeText(shareLink(form))
    copied.value = form.id
    setTimeout(() => (copied.value = null), 2000)
}

async function handleDelete(form: IntakeForm): Promise<void> {
    if (!confirm(`Deactivate "${form.title}"?`)) return
    deleting.value = form.id
    try {
        await store.deleteForm(form.id)
    } catch {
        error.value = 'Failed to deactivate form.'
    } finally {
        deleting.value = null
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <h1 class="text-sm font-semibold text-gray-900">Intake Forms</h1>
                <router-link
                    to="/intake-forms/new"
                    class="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    New Intake Form
                </router-link>
            </div>
        </header>

        <main class="max-w-5xl mx-auto px-6 py-8">
            <p v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</p>

            <!-- Loading -->
            <div v-if="store.loading" class="space-y-3">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="h-14 bg-white rounded-xl border border-gray-100 animate-pulse"
                />
            </div>

            <!-- Empty state -->
            <div
                v-else-if="store.forms.length === 0"
                class="flex flex-col items-center justify-center py-24 text-center"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4"
                >
                    <svg
                        class="w-6 h-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.75"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2
                                2 0 012-2h5.586a1 1 0 01.707.293l5.414
                                5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <p class="text-sm font-medium text-gray-900 mb-1">No intake forms yet</p>
                <p class="text-xs text-gray-500 mb-5">
                    Create a form to start collecting client information.
                </p>
                <router-link
                    to="/intake-forms/new"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Create your first form
                </router-link>
            </div>

            <!-- Table -->
            <div
                v-else
                class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-100">
                            <th
                                class="text-left px-4 py-3 text-xs font-medium text-gray-500"
                            >
                                Title
                            </th>
                            <th
                                class="text-left px-4 py-3 text-xs font-medium text-gray-500"
                            >
                                Status
                            </th>
                            <th
                                class="text-left px-4 py-3 text-xs font-medium text-gray-500"
                            >
                                Share
                            </th>
                            <th
                                class="px-4 py-3 text-xs font-medium text-gray-500 text-right"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="form in store.forms"
                            :key="form.id"
                            class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                            <td class="px-4 py-3">
                                <p class="font-medium text-gray-900">
                                    {{ form.title }}
                                </p>
                                <p
                                    v-if="form.description"
                                    class="text-xs text-gray-400 mt-0.5 truncate max-w-xs"
                                >
                                    {{ form.description }}
                                </p>
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="
                                        form.isActive
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                    "
                                >
                                    {{ form.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <button
                                    class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                                    @click="copyLink(form)"
                                >
                                    <svg
                                        class="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2
                                                0 012-2h8a2 2 0 012 2v2m-6
                                                12h8a2 2 0 002-2v-8a2 2 0
                                                00-2-2h-8a2 2 0 00-2 2v8a2
                                                2 0 002 2z"
                                        />
                                    </svg>
                                    {{ copied === form.id ? 'Copied!' : 'Copy link' }}
                                </button>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button
                                        class="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                                        @click="
                                            router.push(
                                                `/intake-forms/${form.id}/submissions`
                                            )
                                        "
                                    >
                                        Submissions
                                    </button>
                                    <button
                                        class="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                                        @click="
                                            router.push(`/intake-forms/${form.id}/edit`)
                                        "
                                    >
                                        Edit
                                    </button>
                                    <button
                                        class="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                        :disabled="deleting === form.id"
                                        @click="handleDelete(form)"
                                    >
                                        {{
                                            deleting === form.id
                                                ? 'Deactivating…'
                                                : 'Deactivate'
                                        }}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>
