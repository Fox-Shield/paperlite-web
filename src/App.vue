<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastNotification from '@/components/ToastNotification.vue'
</script>

<template>
    <!-- Skip to content for keyboard/screen-reader users -->
    <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:border focus:border-gray-300 focus:rounded-lg focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow"
    >
        Skip to content
    </a>

    <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
            <component :is="Component" />
        </Transition>
    </RouterView>

    <ToastNotification />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
