<script setup lang="ts">
import type { DocumentVersion } from '@/types/document'

const props = defineProps<{
    version: DocumentVersion
}>()

const emit = defineEmits<{
    close: []
    restore: [versionId: number]
}>()

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}
</script>

<template>
    <div
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="emit('close')"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]"
        >
            <!-- Header -->
            <div
                class="flex items-start justify-between p-5 border-b border-gray-100 shrink-0"
            >
                <div>
                    <div class="flex items-center gap-2">
                        <span
                            class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                        >
                            v{{ props.version.versionNumber }}
                        </span>
                        <span class="text-sm font-semibold text-gray-900">
                            Version Preview
                        </span>
                    </div>
                    <p v-if="props.version.changeNote" class="text-xs text-gray-500 mt-1">
                        {{ props.version.changeNote }}
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5">
                        By {{ props.version.createdBy.name }} &middot;
                        {{ formatDate(props.version.createdAt) }}
                    </p>
                </div>
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

            <!-- Field values -->
            <div class="flex-1 overflow-y-auto p-5">
                <div
                    v-if="Object.keys(props.version.fieldValues).length === 0"
                    class="text-xs text-gray-400 text-center py-8"
                >
                    No field values recorded for this version.
                </div>
                <div v-else class="space-y-3">
                    <div
                        v-for="(value, key) in props.version.fieldValues"
                        :key="key"
                        class="flex items-baseline gap-3 py-2 border-b border-gray-50 last:border-0"
                    >
                        <span class="text-xs font-medium text-gray-500 w-32 shrink-0">
                            {{ key }}
                        </span>
                        <span
                            class="text-sm text-gray-900"
                            :class="{ 'text-gray-300 italic': !value }"
                        >
                            {{ value || '—' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="flex items-center justify-end gap-2 p-5 border-t border-gray-100 shrink-0"
            >
                <button
                    @click="emit('close')"
                    class="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                    Close
                </button>
                <button
                    @click="emit('restore', props.version.id)"
                    class="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                    Restore this version
                </button>
            </div>
        </div>
    </div>
</template>
