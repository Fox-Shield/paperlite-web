<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplateStore } from '@/stores/templates'
import AppSidebar from '@/components/AppSidebar.vue'
import TemplateCard from '@/components/TemplateCard.vue'

const router = useRouter()
const templateStore = useTemplateStore()

const categories = ['All', 'Contracts', 'Proposals', 'Leases', 'Wills', 'Other']
const activeCategory = ref('All')
const searchQuery = ref('')

const filteredTemplates = computed(() => {
  let list = templateStore.galleryTemplates
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    )
  }
  return list
})

async function loadGallery() {
  const cat = activeCategory.value === 'All' ? '' : activeCategory.value
  await templateStore.fetchGallery(cat)
}

watch(activeCategory, loadGallery)

onMounted(loadGallery)
</script>

<template>
  <div class="gallery-layout">
    <AppSidebar />

    <main class="gallery-main">
      <header class="page-header">
        <div>
          <h1 class="page-title">Template Gallery</h1>
          <p class="page-subtitle">Browse starter templates to get started quickly</p>
        </div>
        <button class="btn-primary" @click="router.push('/templates/new')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Template
        </button>
      </header>

      <div class="filters">
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat"
            class="tab"
            :class="{ active: activeCategory === cat }"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search templates..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="templateStore.loading" class="template-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card" />
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredTemplates.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-title">No templates in this category yet.</p>
        <p class="empty-desc">Be the first to create one!</p>
        <button class="btn-primary" @click="router.push('/templates/new')">Create Template</button>
      </div>

      <!-- Template grid -->
      <div v-else class="template-grid">
        <TemplateCard
          v-for="template in filteredTemplates"
          :key="template.id"
          :template="template"
          :show-actions="false"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.gallery-layout {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

.gallery-main {
  flex: 1;
  padding: 32px;
  overflow-y: auto;

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;

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

  .filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;

    .category-tabs {
      display: flex;
      gap: 4px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 4px;

      .tab {
        padding: 6px 14px;
        border: none;
        background: none;
        border-radius: 7px;
        font-size: 13px;
        font-weight: 500;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #f3f4f6;
          color: #374151;
        }

        &.active {
          background: #4f46e5;
          color: white;
        }
      }
    }

    .search-wrapper {
      position: relative;

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
        padding: 8px 12px 8px 32px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        width: 220px;
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

  .empty-state {
    text-align: center;
    padding: 80px 20px;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
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

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>
