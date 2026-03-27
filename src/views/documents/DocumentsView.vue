<script setup>
import { onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'

const router = useRouter()

const documentStore = useDocumentsStore()

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function formatSize(bytes) {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(() => documentStore.fetchDocuments())
</script>

<template>
    <div class="documents-layout">
        <AppSidebar />

        <main class="documents-main">
            <header class="page-header">
                <div>
                    <h1 class="page-title">My Documents</h1>
                    <p class="page-subtitle">Your uploaded and generated documents</p>
                    <button
                        class="shared-link"
                        @click="router.push({ name: 'shared-with-me' })"
                    >
                        Shared with me →
                    </button>
                </div>
                <div class="upload-wrapper" title="Coming in M3 — PDF upload">
                    <button class="btn-upload" disabled>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Document
                    </button>
                    <span class="upload-hint">Coming in M3</span>
                </div>
            </header>

            <!-- Loading -->
            <div v-if="documentStore.loading" class="loading-state">
                <div v-for="i in 4" :key="i" class="skeleton-row" />
            </div>

            <!-- Empty state -->
            <div v-else-if="documentStore.documents.length === 0" class="empty-state">
                <div class="empty-illustration">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>
                <p class="empty-title">No documents yet.</p>
                <p class="empty-desc">Upload your first document to get started.</p>
                <button class="btn-upload-cta" disabled title="Coming in M3 — PDF upload">
                    Upload Document
                    <span class="cta-badge">M3</span>
                </button>
            </div>

            <!-- Documents table -->
            <div v-else class="table-wrapper">
                <table class="docs-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Date Modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="doc in documentStore.documents" :key="doc.id">
                            <td class="doc-name">
                                <svg
                                    class="doc-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                    />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                {{ doc.name || 'Untitled Document' }}
                            </td>
                            <td>
                                <span class="type-badge">{{ doc.type || 'PDF' }}</span>
                            </td>
                            <td class="muted">{{ formatSize(doc.size) }}</td>
                            <td class="muted">
                                {{ formatDate(doc.updatedAt || doc.createdAt) }}
                            </td>
                            <td>
                                <div class="row-actions">
                                    <button class="action-btn" title="Download" disabled>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path
                                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                            />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                    </button>
                                    <button
                                        class="action-btn danger"
                                        title="Delete"
                                        disabled
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <polyline points="3 6 5 6 21 6" />
                                            <path
                                                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>

<style scoped>
.documents-layout {
    display: flex;
    min-height: 100vh;
    background: #f9fafb;
}

.documents-main {
    flex: 1;
    padding: 32px;
    overflow-y: auto;

    .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
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

        .shared-link {
            margin-top: 6px;
            display: inline-block;
            font-size: 13px;
            color: #6b7280;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;

            &:hover {
                color: #111827;
                text-decoration: underline;
            }
        }

        .upload-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;

            .btn-upload {
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
                cursor: not-allowed;
                opacity: 0.5;

                svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .upload-hint {
                font-size: 11px;
                color: #9ca3af;
            }
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

        .empty-illustration {
            margin-bottom: 20px;
            color: #e5e7eb;

            svg {
                width: 72px;
                height: 72px;
                margin: 0 auto;
            }
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
            margin-bottom: 24px;
        }

        .btn-upload-cta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: not-allowed;
            opacity: 0.5;

            .cta-badge {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 1px 6px;
                font-size: 11px;
                font-weight: 700;
            }
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

                &:last-child {
                    border-bottom: none;
                }
            }

            tr:last-child td {
                border-bottom: none;
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

            .type-badge {
                display: inline-block;
                background: #f3f4f6;
                color: #374151;
                font-size: 11px;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 4px;
                text-transform: uppercase;
            }

            .muted {
                color: #9ca3af;
            }

            .row-actions {
                display: flex;
                gap: 4px;

                .action-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 6px;
                    cursor: not-allowed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    opacity: 0.5;

                    svg {
                        width: 14px;
                        height: 14px;
                    }
                }
            }
        }
    }
}
</style>
