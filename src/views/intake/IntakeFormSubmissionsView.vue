<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIntakeFormsStore } from '@/stores/intakeForms'
import type { IntakeFormSubmission } from '@/types/intakeForm'

const route = useRoute()
const router = useRouter()
const store = useIntakeFormsStore()

const formId = computed(() => Number(route.params.id))
const isLoading = ref(false)
const expanded = ref<number | null>(null)

onMounted(async () => {
    isLoading.value = true
    try {
        await Promise.all([
            store.fetchForm(formId.value),
            store.fetchSubmissions(formId.value)
        ])
    } finally {
        isLoading.value = false
    }
})

function toggleExpand(id: number): void {
    expanded.value = expanded.value === id ? null : id
}

function statusColor(status: IntakeFormSubmission['status']): string {
    if (status === 'SUBMITTED') return 'bg-blue-50 text-blue-700'
    if (status === 'PROCESSED') return 'bg-green-50 text-green-700'
    return 'bg-gray-100 text-gray-500'
}

function fieldLabel(fieldId: number): string {
    return (
        store.currentForm?.fields.find((f) => f.id === fieldId)?.label ??
        `Field ${fieldId}`
    )
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
                <button
                    class="text-sm text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1"
                    @click="router.push('/intake-forms')"
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
                    Intake Forms
                </button>
                <span class="text-gray-300">/</span>
                <span class="text-sm font-semibold text-gray-900">
                    {{ store.currentForm?.title ?? 'Submissions' }}
                </span>
            </div>
        </header>

        <main class="max-w-4xl mx-auto px-6 py-8">
            <!-- Loading -->
            <div v-if="isLoading" class="space-y-3">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="h-14 bg-white rounded-xl border border-gray-100 animate-pulse"
                />
            </div>

            <!-- Empty -->
            <div
                v-else-if="store.submissions.length === 0"
                class="flex flex-col items-center justify-center py-24 text-center"
            >
                <p class="text-sm font-medium text-gray-900 mb-1">No submissions yet</p>
                <p class="text-xs text-gray-500">
                    Share the form link to start collecting responses.
                </p>
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
                                Name
                            </th>
                            <th
                                class="text-left px-4 py-3 text-xs font-medium text-gray-500"
                            >
                                Email
                            </th>
                            <th
                                class="text-left px-4 py-3 text-xs font-medium text-gray-500"
                            >
                                Status
                            </th>
                            <th
                                class="text-left px-4 py-3 text-xs font-medium text-gray-500"
                            >
                                Submitted
                            </th>
                            <th class="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="sub in store.submissions" :key="sub.id">
                            <tr
                                class="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                                @click="toggleExpand(sub.id)"
                            >
                                <td class="px-4 py-3 font-medium text-gray-900">
                                    {{ sub.submitterName }}
                                </td>
                                <td class="px-4 py-3 text-gray-500">
                                    {{ sub.submitterEmail }}
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="statusColor(sub.status)"
                                    >
                                        {{ sub.status }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-gray-400 text-xs">
                                    {{
                                        sub.submittedAt
                                            ? new Date(
                                                  sub.submittedAt
                                              ).toLocaleDateString()
                                            : '—'
                                    }}
                                </td>
                                <td class="px-4 py-3 text-right text-gray-400">
                                    <svg
                                        class="w-4 h-4 inline transition-transform"
                                        :class="{
                                            'rotate-90': expanded === sub.id
                                        }"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </td>
                            </tr>

                            <!-- Expanded values -->
                            <tr
                                v-if="expanded === sub.id"
                                class="bg-gray-50 border-b border-gray-100"
                            >
                                <td colspan="5" class="px-4 py-4">
                                    <div class="space-y-2">
                                        <div
                                            v-for="val in sub.values"
                                            :key="val.fieldId"
                                            class="flex items-baseline gap-3"
                                        >
                                            <span
                                                class="text-xs font-medium text-gray-500 w-40 shrink-0"
                                            >
                                                {{ fieldLabel(val.fieldId) }}
                                            </span>
                                            <span class="text-sm text-gray-800">
                                                {{ val.value || '—' }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>
