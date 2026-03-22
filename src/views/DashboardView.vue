<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  const user = authStore.user
  if (!user) return 'there'
  if (user.firstName) return user.firstName
  return user.name || 'there'
})

const quickActions = [
  {
    title: 'Browse Templates',
    desc: 'Explore starter templates for contracts, leases, proposals and more',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    path: '/templates',
    color: '#4f46e5'
  },
  {
    title: 'My Templates',
    desc: "View and manage templates you've created",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    path: '/templates/my',
    color: '#0891b2'
  },
  {
    title: 'My Documents',
    desc: "Access documents you've uploaded or generated",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    path: '/documents',
    color: '#059669'
  }
]
</script>

<template>
  <div class="dashboard-layout">
    <AppSidebar />

    <main class="dashboard-main">
      <header class="page-header">
        <div>
          <h1 class="page-title">Welcome back, {{ userName }} 👋</h1>
          <p class="page-subtitle">Here's what you can do today</p>
        </div>
      </header>

      <section class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <button
            v-for="action in quickActions"
            :key="action.path"
            class="action-card"
            @click="router.push(action.path)"
          >
            <div class="action-icon" :style="{ background: action.color + '1a', color: action.color }">
              <span v-html="action.icon" />
            </div>
            <div class="action-body">
              <p class="action-title">{{ action.title }}</p>
              <p class="action-desc">{{ action.desc }}</p>
            </div>
            <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </section>

      <section class="recent-activity">
        <h2 class="section-title">Recent Activity</h2>
        <div class="activity-empty">
          <p>No recent activity yet. Start by browsing templates or creating your first document.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

.dashboard-main {
  flex: 1;
  padding: 32px;
  overflow-y: auto;

  .page-header {
    margin-bottom: 32px;

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

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
  }

  .quick-actions {
    margin-bottom: 40px;

    .actions-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 640px;

      .action-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s;

        &:hover {
          border-color: #c7d2fe;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
          transform: translateX(2px);
        }

        .action-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          :deep(svg) {
            width: 20px;
            height: 20px;
          }
        }

        .action-body {
          flex: 1;

          .action-title {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 2px;
          }

          .action-desc {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.4;
          }
        }

        .action-arrow {
          width: 18px;
          height: 18px;
          color: #d1d5db;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        &:hover .action-arrow {
          color: #4f46e5;
        }
      }
    }
  }

  .recent-activity {
    max-width: 640px;

    .activity-empty {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }
  }
}
</style>
