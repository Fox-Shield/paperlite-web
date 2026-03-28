<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentVersion } from '@/types/document'

const props = defineProps<{
    versionA: DocumentVersion
    versionB: DocumentVersion
}>()

const emit = defineEmits<{ close: [] }>()

const allKeys = computed(() => {
    const keys = new Set([
        ...Object.keys(props.versionA.fieldValues),
        ...Object.keys(props.versionB.fieldValues)
    ])
    return Array.from(keys)
})

function isDifferent(key: string): boolean {
    return props.versionA.fieldValues[key] !== props.versionB.fieldValues[key]
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}
</script>

<template>
    <div
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="emit('close')"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 flex flex-col max-h-[85vh]"
        >
            <!-- Header -->
            <div
                class="flex items-center justify-between p-5 border-b border-gray-100 shrink-0"
            >
                <span class="text-sm font-semibold text-gray-900">
                    Compare Versions
                </span>
                <button
                    @click="emit('close')"
                    class="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Close"
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

            <!-- Column headers -->
            <div
                class="grid grid-cols-[1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0"
            >
                <div>
                    <span
                        class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700"
                    >
                        v{{ props.versionA.versionNumber }}
                    </span>
                    <span class="text-xs text-gray-400 ml-2">
                        {{ formatDate(props.versionA.createdAt) }}
                    </span>
                </div>
                <div>
                    <span
                        class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700"
                    >
                        v{{ props.versionB.versionNumber }}
                    </span>
                    <span class="text-xs text-gray-400 ml-2">
                        {{ formatDate(props.versionB.createdAt) }}
                    </span>
                </div>
            </div>

            <!-- Comparison rows -->
            <div class="flex-1 overflow-y-auto p-5">
                <div
                    v-if="allKeys.length === 0"
                    class="text-xs text-gray-400 text-center py-8"
                >
                    No fields to compare.
                </div>
                <div v-else class="space-y-2">
                    <div v-for="key in allKeys" :key="key">
                        <p class="text-xs font-medium text-gray-500 mb-1">
                            {{ key }}
                        </p>
                        <div class="grid grid-cols-[1fr_1fr] gap-4">
                            <div
                                class="rounded-lg px-3 py-2 text-sm"
                                :class="
                                    isDifferent(key)
                                        ? 'bg-yellow-50 text-yellow-900'
                                        : 'bg-gray-50 text-gray-900'
                                "
                            >
                                {{ props.versionA.fieldValues[key] || '—' }}
                            </div>
                            <div
                                class="rounded-lg px-3 py-2 text-sm"
                                :class="
                                    isDifferent(key)
                                        ? 'bg-yellow-50 text-yellow-900'
                                        : 'bg-gray-50 text-gray-900'
                                "
                            >
                                {{ props.versionB.fieldValues[key] || '—' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end p-5 border-t border-gray-100 shrink-0">
                <button
                    @click="emit('close')"
                    class="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
</template>
