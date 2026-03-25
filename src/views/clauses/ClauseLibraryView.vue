<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClausesStore } from '@/stores/clauses'
import ClauseCard from '@/components/ClauseCard.vue'

const router = useRouter()
const store = useClausesStore()

const search = ref('')
const activeCategory = ref('All')
const activeTags = ref<string[]>([])

onMounted(() => store.fetchClauses())

const categories = computed(() => {
    const cats = new Set(store.clauses.map((c) => c.category))
    return ['All', ...Array.from(cats).sort()]
})

const allTags = computed(() => {
    const tags = new Set(store.clauses.flatMap((c) => c.tags))
    return Array.from(tags).sort()
})

const filtered = computed(() => {
    return store.clauses.filter((c) => {
        const matchesSearch =
            !search.value ||
            c.title.toLowerCase().includes(search.value.toLowerCase()) ||
            c.category.toLowerCase().includes(search.value.toLowerCase()) ||
            c.tags.some((t) => t.toLowerCase().includes(search.value.toLowerCase()))
        const matchesCategory =
            activeCategory.value === 'All' || c.category === activeCategory.value
        const matchesTags =
            activeTags.value.length === 0 ||
            activeTags.value.every((t) => c.tags.includes(t))
        return matchesSearch && matchesCategory && matchesTags
    })
})

function toggleTag(tag: string): void {
    const idx = activeTags.value.indexOf(tag)
    if (idx === -1) activeTags.value.push(tag)
    else activeTags.value.splice(idx, 1)
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <h1 class="text-sm font-semibold text-gray-900">Clause Library</h1>
                <router-link
                    to="/clause-library/new"
                    class="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    New Clause
                </router-link>
            </div>
        </header>

        <main class="max-w-6xl mx-auto px-6 py-8">
            <!-- Search -->
            <div class="mb-5">
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search clauses…"
                    class="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400"
                />
            </div>

            <!-- Category tabs -->
            <div class="flex items-center gap-1 mb-4 flex-wrap">
                <button
                    v-for="cat in categories"
                    :key="cat"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    :class="
                        activeCategory === cat
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    "
                    @click="activeCategory = cat"
                >
                    {{ cat }}
                </button>
            </div>

            <!-- Tag filter chips -->
            <div
                v-if="allTags.length > 0"
                class="flex items-center gap-1.5 mb-6 flex-wrap"
            >
                <button
                    v-for="tag in allTags"
                    :key="tag"
                    class="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                    :class="
                        activeTags.includes(tag)
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    "
                    @click="toggleTag(tag)"
                >
                    {{ tag }}
                </button>
            </div>

            <!-- Loading -->
            <div v-if="store.loading" class="grid grid-cols-3 gap-4">
                <div
                    v-for="i in 6"
                    :key="i"
                    class="h-40 bg-white rounded-xl border border-gray-100 animate-pulse"
                />
            </div>

            <!-- Empty state -->
            <div
                v-else-if="filtered.length === 0"
                class="flex flex-col items-center justify-center py-24 text-center"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4"
                >
                    <svg
                        class="w-6 h-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.75"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2
                                2 0 012-2h5.586a1 1 0 01.707.293l5.414
                                5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <p class="text-sm font-medium text-gray-900 mb-1">
                    {{
                        store.clauses.length === 0
                            ? 'No clauses yet'
                            : 'No clauses match your filters'
                    }}
                </p>
                <p class="text-xs text-gray-500 mb-5">
                    {{
                        store.clauses.length === 0
                            ? 'Create your first reusable clause.'
                            : 'Try adjusting your search or filters.'
                    }}
                </p>
                <router-link
                    v-if="store.clauses.length === 0"
                    to="/clause-library/new"
                    class="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Create your first clause
                </router-link>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ClauseCard
                    v-for="clause in filtered"
                    :key="clause.id"
                    :clause="clause"
                    @view="router.push(`/clause-library/${clause.id}`)"
                    @edit="router.push(`/clause-library/${clause.id}/edit`)"
                />
            </div>
        </main>
    </div>
</template>
