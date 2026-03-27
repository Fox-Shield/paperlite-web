<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrganizationStore } from '@/stores/organization'

const store = useOrganizationStore()
const orgName = ref('')
const creating = ref(false)
const error = ref('')

const org = computed(() => store.organizations[0] ?? null)

onMounted(async () => {
    await store.fetchOrganizations()
})

async function handleCreate(): Promise<void> {
    if (!orgName.value.trim()) return
    creating.value = true
    error.value = ''
    try {
        await store.createOrganization(orgName.value.trim())
    } catch {
        error.value = 'Failed to create organization.'
    } finally {
        creating.value = false
    }
}
</script>

<template>
    <div class="max-w-lg space-y-6">
        <div v-if="store.loading" class="text-sm text-gray-400">Loading...</div>

        <!-- Create org -->
        <section v-else-if="!org">
            <h2 class="text-sm font-semibold text-gray-900 mb-1">
                Create an Organization
            </h2>
            <p class="text-xs text-gray-500 mb-4">
                Organizations let you manage a team with shared billing and access.
            </p>
            <div class="flex gap-2">
                <input
                    v-model="orgName"
                    type="text"
                    placeholder="Organization name"
                    class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    @keyup.enter="handleCreate"
                />
                <button
                    class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    :disabled="creating || !orgName.trim()"
                    @click="handleCreate"
                >
                    Create
                </button>
            </div>
            <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
        </section>

        <!-- Org details -->
        <section v-else class="space-y-4">
            <h2 class="text-sm font-semibold text-gray-900">Organization</h2>
            <div class="border border-gray-200 rounded-xl p-5 space-y-3">
                <div>
                    <p class="text-xs text-gray-500 mb-0.5">Name</p>
                    <p class="text-sm font-medium text-gray-900">{{ org.name }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 mb-0.5">Slug</p>
                    <p class="text-sm text-gray-600 font-mono">{{ org.slug }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 mb-0.5">Members</p>
                    <p class="text-sm text-gray-900">{{ org.members.length }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 mb-0.5">Created</p>
                    <p class="text-sm text-gray-900">
                        {{ new Date(org.createdAt).toLocaleDateString() }}
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>
