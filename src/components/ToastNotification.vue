<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const icons: Record<string, string> = {
    success: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    error: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
    warning: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
    info: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
}

const colorMap: Record<string, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
}

const iconColorMap: Record<string, string> = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
}
</script>

<template>
    <div
        aria-live="polite"
        aria-atomic="false"
        class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none"
    >
        <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
            <div
                v-for="toast in toastStore.toasts"
                :key="toast.id"
                role="status"
                class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm"
                :class="colorMap[toast.type]"
            >
                <span
                    class="w-4 h-4 mt-0.5 shrink-0"
                    :class="iconColorMap[toast.type]"
                    v-html="icons[toast.type]"
                    aria-hidden="true"
                />
                <span class="flex-1">
                    {{ toast.message }}
                    <a
                        v-if="toast.action"
                        :href="toast.action.href"
                        class="ml-1 underline font-medium hover:opacity-80"
                    >
                        {{ toast.action.label }}
                    </a>
                </span>
                <button
                    @click="toastStore.remove(toast.id)"
                    aria-label="Dismiss notification"
                    class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-enter-active {
    transition: all 0.25s ease;
}
.toast-leave-active {
    transition: all 0.2s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
.toast-move {
    transition: transform 0.2s ease;
}
</style>
