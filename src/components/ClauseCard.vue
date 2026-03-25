<script setup lang="ts">
import type { ClauseSummary } from '@/types/clause'

const props = defineProps<{
    clause: ClauseSummary
}>()

const emit = defineEmits<{
    view: []
    edit: []
}>()

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
    <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:border-gray-200 transition-colors"
    >
        <!-- Title + version -->
        <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-gray-900 leading-snug">
                {{ props.clause.title }}
            </p>
            <span
                class="shrink-0 text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5"
            >
                v{{ props.clause.version }}
            </span>
        </div>

        <!-- Category badge -->
        <div class="flex items-center gap-2">
            <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="categoryColor(props.clause.category)"
            >
                {{ props.clause.category }}
            </span>
            <span
                v-if="props.clause.isPublic"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100"
            >
                Public
            </span>
        </div>

        <!-- Tags -->
        <div
            v-if="props.clause.tags.length > 0"
            class="flex items-center gap-1.5 flex-wrap"
        >
            <span
                v-for="tag in props.clause.tags.slice(0, 4)"
                :key="tag"
                class="px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500 border border-gray-100"
            >
                {{ tag }}
            </span>
            <span v-if="props.clause.tags.length > 4" class="text-xs text-gray-400">
                +{{ props.clause.tags.length - 4 }}
            </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 mt-auto pt-1 border-t border-gray-50">
            <button
                class="text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
                @click="emit('view')"
            >
                View
            </button>
            <button
                class="text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
                @click="emit('edit')"
            >
                Edit
            </button>
        </div>
    </div>
</template>
