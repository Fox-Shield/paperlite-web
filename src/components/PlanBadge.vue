<script setup lang="ts">
import type { PlanTier } from '@/types/subscription'

defineProps<{
    tier: PlanTier
}>()
</script>

<template>
    <span
        class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
        :class="{
            'bg-gray-100 text-gray-600': tier === 'FREE',
            'bg-blue-100 text-blue-700': tier === 'PRO',
            'bg-purple-100 text-purple-700': tier === 'ENTERPRISE'
        }"
    >
        {{ tier }}
    </span>
</template>
