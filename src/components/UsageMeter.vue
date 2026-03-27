<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    label: string
    used: number
    limit: number
}>()

const isUnlimited = computed(() => props.limit === -1)
const percent = computed(() => {
    if (isUnlimited.value || props.limit === 0) return 0
    return Math.min(100, Math.round((props.used / props.limit) * 100))
})

const barColor = computed(() => {
    if (percent.value >= 95) return 'bg-red-500'
    if (percent.value >= 80) return 'bg-orange-400'
    return 'bg-blue-500'
})
</script>

<template>
    <div class="space-y-1">
        <div class="flex justify-between text-xs text-gray-600">
            <span>{{ label }}</span>
            <span v-if="isUnlimited" class="text-gray-400">Unlimited</span>
            <span v-else>{{ used }} / {{ limit }}</span>
        </div>
        <div v-if="!isUnlimited" class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
                class="h-full rounded-full transition-all"
                :class="barColor"
                :style="{ width: `${percent}%` }"
            />
        </div>
    </div>
</template>
