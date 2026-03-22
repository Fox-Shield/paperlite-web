<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  {
    label: 'Home',
    path: '/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  {
    label: 'Documents',
    path: '/documents',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
  },
  {
    label: 'Template Gallery',
    path: '/templates',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
  },
  {
    label: 'My Templates',
    path: '/templates/my',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
  },
  {
    label: 'Workspaces',
    path: '/workspaces',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
  }
]

function isActive(path) {
  if (path === '/templates' && route.path === '/templates/my') return false
  return route.path === path || route.path.startsWith(path + '/')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return '?'
  const first = user.firstName?.[0] || user.name?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
})

const userName = computed(() => {
  const user = authStore.user
  if (!user) return ''
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
  return user.name || user.email || ''
})
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-logo">
      <router-link to="/dashboard" class="logo-link">
        <span class="logo-icon">P</span>
        <span class="logo-text">PaperLite</span>
      </router-link>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <div class="upgrade-banner">
        <p class="upgrade-title">Upgrade to Premium</p>
        <p class="upgrade-desc">Unlock unlimited templates &amp; e-signatures</p>
        <button class="upgrade-btn">Upgrade</button>
      </div>

      <div class="user-section">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-info">
          <p class="user-name">{{ userName }}</p>
          <button class="logout-btn" @click="logout">Log out</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  min-height: 100vh;
  background: #111827;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid #1f2937;

    .logo-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;

      .logo-icon {
        width: 32px;
        height: 32px;
        background: #4f46e5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 16px;
      }

      .logo-text {
        color: white;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: -0.01em;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: #9ca3af;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: #1f2937;
        color: #e5e7eb;
      }

      &.active {
        background: #1f2937;
        color: white;

        .nav-icon {
          color: #818cf8;
        }
      }

      .nav-icon {
        width: 18px;
        height: 18px;
        flex-shrink: 0;

        :deep(svg) {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .sidebar-bottom {
    padding: 16px 12px;
    border-top: 1px solid #1f2937;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .upgrade-banner {
      background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
      border-radius: 10px;
      padding: 14px;

      .upgrade-title {
        color: white;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .upgrade-desc {
        color: #a5b4fc;
        font-size: 11px;
        line-height: 1.4;
        margin-bottom: 10px;
      }

      .upgrade-btn {
        width: 100%;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 7px 12px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;

        &:hover {
          background: #4338ca;
        }
      }
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 4px;

      .user-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #374151;
        color: #e5e7eb;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .user-name {
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 12px;
          cursor: pointer;
          padding: 0;

          &:hover {
            color: #9ca3af;
          }
        }
      }
    }
  }
}
</style>
