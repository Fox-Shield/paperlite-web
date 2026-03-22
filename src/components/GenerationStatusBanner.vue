<script setup lang="ts">
import type { GenerationRequest } from '@/types/generation'

defineProps<{
    request: GenerationRequest
    isGenerating: boolean
}>()

const emit = defineEmits<{
    download: []
    retry: []
}>()
</script>

<template>
    <!-- PENDING / PROCESSING -->
    <div
        v-if="request.status === 'PENDING' || request.status === 'PROCESSING'"
        class="bg-yellow-50 border-b border-yellow-100 px-4 py-3"
    >
        <div class="max-w-7xl mx-auto flex items-center gap-3">
            <svg
                class="animate-spin w-4 h-4 text-yellow-600 shrink-0"
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
            <p class="text-sm text-yellow-800 font-medium">Generating your PDF…</p>
        </div>
    </div>

    <!-- COMPLETED -->
    <div
        v-else-if="request.status === 'COMPLETED'"
        class="bg-green-50 border-b border-green-100 px-4 py-3"
    >
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-2">
                <svg
                    class="w-4 h-4 text-green-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                <p class="text-sm text-green-800 font-medium">Your PDF is ready</p>
            </div>
            <button
                @click="emit('download')"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-700 text-white text-xs font-medium hover:bg-green-800 transition-colors"
            >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
                Download PDF
            </button>
        </div>
    </div>

    <!-- FAILED -->
    <div
        v-else-if="request.status === 'FAILED'"
        class="bg-red-50 border-b border-red-100 px-4 py-3"
    >
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-2">
                <svg
                    class="w-4 h-4 text-red-600 shrink-0"
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
                <p class="text-sm text-red-700 font-medium">
                    {{ request.errorMessage ?? 'PDF generation failed.' }}
                </p>
            </div>
            <button
                @click="emit('retry')"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    </div>
</template>
