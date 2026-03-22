<script setup>
import { useRouter } from 'vue-router'
import { useTemplateStore } from '@/stores/templates'

const props = defineProps({
  template: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['deleted'])

const router = useRouter()
const templateStore = useTemplateStore()

const categoryColors = {
  Contracts: { bg: '#eff6ff', text: '#1d4ed8' },
  Proposals: { bg: '#f0fdf4', text: '#15803d' },
  Leases: { bg: '#fefce8', text: '#a16207' },
  Wills: { bg: '#fdf4ff', text: '#7e22ce' },
  Other: { bg: '#f9fafb', text: '#374151' }
}

function getCategoryStyle(category) {
  const colors = categoryColors[category] || categoryColors.Other
  return { backgroundColor: colors.bg, color: colors.text }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function editTemplate() {
  router.push(`/templates/${props.template.id}/edit`)
}

async function deleteTemplate() {
  if (!confirm(`Delete "${props.template.name}"? This cannot be undone.`)) return
  await templateStore.deleteTemplate(props.template.id)
  emit('deleted', props.template.id)
}
</script>

<template>
  <div class="template-card">
    <div class="card-header">
      <span class="category-badge" :style="getCategoryStyle(template.category)">
        {{ template.category || 'Other' }}
      </span>
      <div v-if="showActions" class="card-actions">
        <button class="action-btn" title="Edit" @click="editTemplate">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn delete" title="Delete" @click="deleteTemplate">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ template.name }}</h3>
      <p class="card-desc">{{ template.description || 'No description provided.' }}</p>
    </div>

    <div class="card-footer">
      <span class="field-count">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        {{ (template.fields || []).length }} field{{ (template.fields || []).length !== 1 ? 's' : '' }}
      </span>
      <span class="created-date">{{ formatDate(template.createdAt) }}</span>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.15s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .category-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;
      letter-spacing: 0.02em;
    }

    .card-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: #f3f4f6;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      transition: all 0.15s;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: #e5e7eb;
        color: #374151;
      }

      &.delete:hover {
        background: #fee2e2;
        color: #dc2626;
      }
    }
  }

  &:hover .card-actions {
    opacity: 1;
  }

  .card-body {
    flex: 1;

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 6px;
      line-height: 1.3;
    }

    .card-desc {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid #f3f4f6;

    .field-count {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #9ca3af;

      svg {
        width: 13px;
        height: 13px;
      }
    }

    .created-date {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}
</style>
