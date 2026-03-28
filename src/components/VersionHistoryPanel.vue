<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import VersionPreviewModal from '@/components/VersionPreviewModal.vue'
import VersionCompareModal from '@/components/VersionCompareModal.vue'
import type { DocumentVersion } from '@/types/document'

const props = defineProps<{ documentId: number }>()

const documentsStore = useDocumentsStore()

const previewVersion = ref<DocumentVersion | null>(null)
const compareSelections = ref<number[]>([])
const showCompare = ref(false)
const confirmRestoreId = ref<number | null>(null)
const isRestoring = ref(false)

const versions = computed(() => documentsStore.versions)
const loading = computed(() => documentsStore.versionsLoading)

const latestVersionNumber = computed(() => {
    if (versions.value.length === 0) return 0
    return Math.max(...versions.value.map((v) => v.versionNumber))
})

const compareVersionA = computed(
    () => versions.value.find((v) => v.id === compareSelections.value[0]) ?? null
)
const compareVersionB = computed(
    () => versions.value.find((v) => v.id === compareSelections.value[1]) ?? null
)

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

function toggleCompareSelection(id: number): void {
    const idx = compareSelections.value.indexOf(id)
    if (idx !== -1) {
        compareSelections.value.splice(idx, 1)
    } else if (compareSelections.value.length < 2) {
        compareSelections.value.push(id)
    }
}

async function handleRestore(versionId: number): Promise<void> {
    isRestoring.value = true
    try {
        await documentsStore.restoreVersion(props.documentId, versionId)
        confirmRestoreId.value = null
        previewVersion.value = null
    } finally {
        isRestoring.value = false
    }
}

onMounted(() => documentsStore.fetchVersions(props.documentId))
</script>

<template>
    <div class="w-72 shrink-0 bg-white border-l border-gray-100 flex flex-col h-full">
        <!-- Panel header -->
        <div
            class="h-12 flex items-center justify-between px-4 border-b border-gray-100 shrink-0"
        >
            <span class="text-sm font-semibold text-gray-800"> Version History </span>
            <button
                v-if="compareSelections.length === 2"
                @click="showCompare = true"
                class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                Compare
            </button>
        </div>

        <!-- Compare hint -->
        <div
            v-if="compareSelections.length > 0"
            class="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 shrink-0"
        >
            {{ compareSelections.length }}/2 selected for compare
        </div>

        <!-- Versions list -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div v-if="loading" class="flex flex-col gap-2">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="h-16 bg-gray-50 rounded-lg animate-pulse"
                />
            </div>

            <div
                v-else-if="versions.length === 0"
                class="text-xs text-gray-400 text-center py-8"
            >
                No versions yet.
            </div>

            <div
                v-for="version in versions"
                :key="version.id"
                class="rounded-xl border p-3 transition-colors"
                :class="
                    compareSelections.includes(version.id)
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                "
            >
                <div class="flex items-start gap-2">
                    <!-- Compare checkbox -->
                    <input
                        type="checkbox"
                        :checked="compareSelections.includes(version.id)"
                        :disabled="
                            !compareSelections.includes(version.id) &&
                            compareSelections.length >= 2
                        "
                        @change="toggleCompareSelection(version.id)"
                        class="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span
                                class="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700"
                            >
                                v{{ version.versionNumber }}
                            </span>
                            <span
                                v-if="version.versionNumber === latestVersionNumber"
                                class="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"
                            >
                                current
                            </span>
                        </div>
                        <p
                            v-if="version.changeNote"
                            class="text-xs text-gray-700 mt-1 truncate"
                        >
                            {{ version.changeNote }}
                        </p>
                        <p class="text-xs text-gray-400 mt-0.5">
                            {{ version.createdBy.name }} &middot;
                            {{ formatDate(version.createdAt) }}
                        </p>
                        <!-- Actions -->
                        <div class="flex items-center gap-2 mt-2">
                            <button
                                @click="previewVersion = version"
                                class="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                            >
                                View
                            </button>
                            <template
                                v-if="version.versionNumber !== latestVersionNumber"
                            >
                                <span class="text-gray-200">|</span>
                                <button
                                    @click="confirmRestoreId = version.id"
                                    class="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Restore
                                </button>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Inline restore confirm -->
                <div
                    v-if="confirmRestoreId === version.id"
                    class="mt-2 pt-2 border-t border-gray-100"
                >
                    <p class="text-xs text-gray-600 mb-2">
                        Restore to v{{ version.versionNumber }}?
                    </p>
                    <div class="flex gap-2">
                        <button
                            @click="handleRestore(version.id)"
                            :disabled="isRestoring"
                            class="text-xs font-medium text-white bg-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {{ isRestoring ? 'Restoring…' : 'Confirm' }}
                        </button>
                        <button
                            @click="confirmRestoreId = null"
                            class="text-xs text-gray-400 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Version Preview Modal -->
    <VersionPreviewModal
        v-if="previewVersion"
        :version="previewVersion"
        @close="previewVersion = null"
        @restore="
            (id) => {
                previewVersion = null
                confirmRestoreId = id
            }
        "
    />

    <!-- Version Compare Modal -->
    <VersionCompareModal
        v-if="showCompare && compareVersionA && compareVersionB"
        :version-a="compareVersionA"
        :version-b="compareVersionB"
        @close="showCompare = false"
    />
</template>
