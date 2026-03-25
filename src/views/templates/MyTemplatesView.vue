<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '@/stores/templates'
import AppSidebar from '@/components/AppSidebar.vue'
import TemplateCard from '@/components/TemplateCard.vue'

const router = useRouter()
const templateStore = useTemplatesStore()

const searchQuery = ref('')

const filteredTemplates = computed(() => {
    if (!searchQuery.value.trim()) return templateStore.templates
    const q = searchQuery.value.toLowerCase()
    return templateStore.templates.filter(
        (t) =>
            t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    )
})

onMounted(() => templateStore.fetchMyTemplates())
</script>

<template>
    <div class="my-templates-layout">
        <AppSidebar />

        <main class="my-templates-main">
            <header class="page-header">
                <div>
                    <h1 class="page-title">My Templates</h1>
                    <p class="page-subtitle">Templates you've created and saved</p>
                </div>
                <button class="btn-primary" @click="router.push('/templates/new')">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Template
                </button>
            </header>

            <div v-if="templateStore.templates.length > 0" class="search-wrapper">
                <svg
                    class="search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search your templates..."
                    class="search-input"
                />
            </div>

            <!-- Loading skeleton -->
            <div v-if="templateStore.loading" class="template-grid">
                <div v-for="i in 6" :key="i" class="skeleton-card" />
            </div>

            <!-- Empty state -->
            <div v-else-if="templateStore.templates.length === 0" class="empty-state">
                <div class="empty-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                </div>
                <p class="empty-title">No templates yet</p>
                <p class="empty-desc">Create your first template to get started</p>
                <button class="btn-primary" @click="router.push('/templates/new')">
                    Create your first template
                </button>
            </div>

            <!-- No search results -->
            <div v-else-if="filteredTemplates.length === 0" class="empty-state">
                <div class="empty-icon">🔍</div>
                <p class="empty-title">No templates match your search</p>
                <p class="empty-desc">Try a different search term</p>
            </div>

            <!-- Template grid -->
            <div v-else class="template-grid">
                <TemplateCard
                    v-for="template in filteredTemplates"
                    :key="template.id"
                    :template="template"
                    :show-actions="true"
                    @deleted="templateStore.deleteTemplate(template.id)"
                />
            </div>
        </main>
    </div>
</template>

<style scoped>
.my-templates-layout {
    display: flex;
    min-height: 100vh;
    background: #f9fafb;
}

.my-templates-main {
    flex: 1;
    padding: 32px;
    overflow-y: auto;

    .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;

        .page-title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
        }

        .page-subtitle {
            font-size: 14px;
            color: #6b7280;
        }
    }

    .search-wrapper {
        position: relative;
        margin-bottom: 24px;
        max-width: 320px;

        .search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 15px;
            height: 15px;
            color: #9ca3af;
        }

        .search-input {
            width: 100%;
            padding: 8px 12px 8px 32px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            background: white;
            transition: border-color 0.15s;

            &:focus {
                border-color: #4f46e5;
            }

            &::placeholder {
                color: #9ca3af;
            }
        }
    }

    .template-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;

        @media (max-width: 1100px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 700px) {
            grid-template-columns: 1fr;
        }
    }

    .skeleton-card {
        height: 180px;
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        border-radius: 12px;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .empty-state {
        text-align: center;
        padding: 80px 20px;

        .empty-icon {
            margin-bottom: 16px;
            color: #d1d5db;

            svg {
                width: 64px;
                height: 64px;
                margin: 0 auto;
            }

            font-size: 48px;
        }

        .empty-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }

        .empty-desc {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 20px;
        }
    }
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;

    svg {
        width: 16px;
        height: 16px;
    }

    &:hover {
        background: #4338ca;
    }
}
</style>
