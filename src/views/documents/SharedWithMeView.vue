<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSharesStore } from '@/stores/shares'
import AppSidebar from '@/components/AppSidebar.vue'

const router = useRouter()
const sharesStore = useSharesStore()

const permissionBadgeClass: Record<string, string> = {
    READ: 'badge-gray',
    COMMENT: 'badge-blue',
    WRITE: 'badge-green'
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function openDocument(id: string): void {
    router.push({ name: 'document-detail', params: { id } })
}

onMounted(() => sharesStore.fetchSharedWithMe())
</script>

<template>
    <div class="layout">
        <AppSidebar />

        <main class="main">
            <header class="page-header">
                <div>
                    <h1 class="page-title">Shared with Me</h1>
                    <p class="page-subtitle">Documents others have shared with you</p>
                </div>
            </header>

            <!-- Loading -->
            <div v-if="sharesStore.loading" class="loading-state">
                <div v-for="i in 4" :key="i" class="skeleton-row" />
            </div>

            <!-- Empty -->
            <div v-else-if="sharesStore.sharedWithMe.length === 0" class="empty-state">
                <svg
                    class="empty-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                    />
                </svg>
                <p class="empty-title">No shared documents yet.</p>
                <p class="empty-desc">
                    When someone shares a document with you, it will appear here.
                </p>
            </div>

            <!-- Table -->
            <div v-else class="table-wrapper">
                <table class="docs-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Owner</th>
                            <th>Permission</th>
                            <th>Last Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="doc in sharesStore.sharedWithMe"
                            :key="doc.id"
                            class="clickable-row"
                            @click="openDocument(doc.id)"
                        >
                            <td class="doc-name">
                                <svg
                                    class="doc-icon"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                                    />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                {{ doc.name || 'Untitled Document' }}
                            </td>
                            <td class="muted">{{ doc.ownerName }}</td>
                            <td>
                                <span
                                    class="permission-badge"
                                    :class="permissionBadgeClass[doc.permission]"
                                >
                                    {{ doc.permission }}
                                </span>
                            </td>
                            <td class="muted">
                                {{ formatDate(doc.updatedAt || doc.createdAt) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background: #f9fafb;
}

.main {
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

    .loading-state {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .skeleton-row {
            height: 52px;
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            border-radius: 8px;
            animation: shimmer 1.5s infinite;
        }
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
        padding: 100px 20px;

        .empty-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 20px;
            color: #e5e7eb;
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
        }
    }

    .table-wrapper {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;

        .docs-table {
            width: 100%;
            border-collapse: collapse;

            th {
                padding: 12px 16px;
                text-align: left;
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
            }

            td {
                padding: 14px 16px;
                font-size: 13px;
                color: #374151;
                border-bottom: 1px solid #f3f4f6;
            }

            tr:last-child td {
                border-bottom: none;
            }

            .clickable-row {
                cursor: pointer;

                &:hover td {
                    background: #f9fafb;
                }
            }

            .doc-name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                color: #111827;

                .doc-icon {
                    width: 16px;
                    height: 16px;
                    color: #9ca3af;
                    flex-shrink: 0;
                }
            }

            .muted {
                color: #9ca3af;
            }

            .permission-badge {
                display: inline-block;
                font-size: 11px;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 4px;
                text-transform: uppercase;

                &.badge-gray {
                    background: #f3f4f6;
                    color: #374151;
                }

                &.badge-blue {
                    background: #dbeafe;
                    color: #1d4ed8;
                }

                &.badge-green {
                    background: #dcfce7;
                    color: #15803d;
                }
            }
        }
    }
}
</style>
