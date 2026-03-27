<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCommentsStore } from '@/stores/comments'
import { useAuthStore } from '@/stores/auth'
import { wsService } from '@/services/websocket'
import type { Comment } from '@/types/collaboration'

const props = defineProps<{ documentId: string }>()

const commentsStore = useCommentsStore()
const authStore = useAuthStore()

const newCommentText = ref('')
const replyingTo = ref<string | null>(null)
const replyText = ref('')
const editingId = ref<string | null>(null)
const editText = ref('')
let subscription: ReturnType<typeof wsService.subscribeToDocumentComments> | null = null

function formatTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

function isOwnComment(comment: Comment): boolean {
    return comment.author.id === authStore.user?.id
}

async function handlePostComment(): Promise<void> {
    if (!newCommentText.value.trim()) return
    await commentsStore.addComment(props.documentId, {
        content: newCommentText.value.trim()
    })
    newCommentText.value = ''
}

async function handlePostReply(parentId: string): Promise<void> {
    if (!replyText.value.trim()) return
    await commentsStore.addComment(props.documentId, {
        content: replyText.value.trim(),
        parentCommentId: parentId
    })
    replyText.value = ''
    replyingTo.value = null
}

function startEdit(comment: Comment): void {
    editingId.value = comment.id
    editText.value = comment.content
}

async function handleSaveEdit(commentId: string): Promise<void> {
    if (!editText.value.trim()) return
    await commentsStore.updateComment(props.documentId, commentId, {
        content: editText.value.trim()
    })
    editingId.value = null
    editText.value = ''
}

async function handleDelete(commentId: string): Promise<void> {
    await commentsStore.deleteComment(props.documentId, commentId)
}

onMounted(async () => {
    await commentsStore.fetchComments(props.documentId)
    subscription = wsService.subscribeToDocumentComments(props.documentId, (comment) => {
        commentsStore.receiveRealtimeComment(comment)
    })
})

onUnmounted(() => {
    if (subscription) subscription.unsubscribe()
})
</script>

<template>
    <div class="w-72 shrink-0 bg-white border-l border-gray-100 flex flex-col h-full">
        <!-- Panel header -->
        <div class="h-12 flex items-center px-4 border-b border-gray-100 shrink-0">
            <span class="text-sm font-semibold text-gray-800">Comments</span>
        </div>

        <!-- New comment input -->
        <div class="p-3 border-b border-gray-100 shrink-0">
            <textarea
                v-model="newCommentText"
                rows="2"
                placeholder="Add a comment…"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
                @click="handlePostComment"
                :disabled="!newCommentText.trim()"
                class="mt-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Post
            </button>
        </div>

        <!-- Comments list -->
        <div class="flex-1 overflow-y-auto p-3 space-y-4">
            <div v-if="commentsStore.loading" class="flex flex-col gap-2">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="h-14 bg-gray-50 rounded-lg animate-pulse"
                />
            </div>

            <div
                v-else-if="commentsStore.comments.length === 0"
                class="text-xs text-gray-400 text-center py-8"
            >
                No comments yet.
            </div>

            <!-- Top-level comments -->
            <div v-for="comment in commentsStore.comments" :key="comment.id">
                <!-- Comment bubble -->
                <div class="group">
                    <div class="flex items-start gap-2">
                        <div
                            class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5"
                        >
                            <span class="text-xs font-medium text-gray-600">
                                {{ comment.author.name.charAt(0).toUpperCase() }}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-baseline gap-1.5">
                                <span class="text-xs font-semibold text-gray-800">
                                    {{ comment.author.name }}
                                </span>
                                <span class="text-xs text-gray-400">
                                    {{ formatTime(comment.createdAt) }}
                                </span>
                            </div>

                            <!-- Edit mode -->
                            <div v-if="editingId === comment.id" class="mt-1">
                                <textarea
                                    v-model="editText"
                                    rows="2"
                                    class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                <div class="flex gap-1.5 mt-1">
                                    <button
                                        @click="handleSaveEdit(comment.id)"
                                        class="text-xs text-gray-900 font-medium hover:underline"
                                    >
                                        Save
                                    </button>
                                    <button
                                        @click="editingId = null"
                                        class="text-xs text-gray-400 hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <p v-else class="text-xs text-gray-700 mt-0.5">
                                {{ comment.content }}
                            </p>

                            <!-- Actions -->
                            <div
                                class="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <button
                                    @click="
                                        replyingTo =
                                            replyingTo === comment.id ? null : comment.id
                                    "
                                    class="text-xs text-gray-400 hover:text-gray-700"
                                >
                                    Reply
                                </button>
                                <template v-if="isOwnComment(comment)">
                                    <button
                                        @click="startEdit(comment)"
                                        class="text-xs text-gray-400 hover:text-gray-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        @click="handleDelete(comment.id)"
                                        class="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        Delete
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reply input -->
                <div v-if="replyingTo === comment.id" class="ml-8 mt-2">
                    <textarea
                        v-model="replyText"
                        rows="2"
                        placeholder="Write a reply…"
                        class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <div class="flex gap-2 mt-1">
                        <button
                            @click="handlePostReply(comment.id)"
                            :disabled="!replyText.trim()"
                            class="text-xs font-medium text-gray-900 hover:underline disabled:opacity-40"
                        >
                            Reply
                        </button>
                        <button
                            @click="replyingTo = null"
                            class="text-xs text-gray-400 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <!-- Replies -->
                <div v-if="comment.replies.length > 0" class="ml-8 mt-2 space-y-3">
                    <div v-for="reply in comment.replies" :key="reply.id" class="group">
                        <div class="flex items-start gap-2">
                            <div
                                class="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5"
                            >
                                <span class="text-xs font-medium text-gray-500">
                                    {{ reply.author.name.charAt(0).toUpperCase() }}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-baseline gap-1.5">
                                    <span class="text-xs font-semibold text-gray-800">
                                        {{ reply.author.name }}
                                    </span>
                                    <span class="text-xs text-gray-400">
                                        {{ formatTime(reply.createdAt) }}
                                    </span>
                                </div>

                                <!-- Edit mode for reply -->
                                <div v-if="editingId === reply.id" class="mt-1">
                                    <textarea
                                        v-model="editText"
                                        rows="2"
                                        class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                    <div class="flex gap-1.5 mt-1">
                                        <button
                                            @click="handleSaveEdit(reply.id)"
                                            class="text-xs text-gray-900 font-medium hover:underline"
                                        >
                                            Save
                                        </button>
                                        <button
                                            @click="editingId = null"
                                            class="text-xs text-gray-400 hover:underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                <p v-else class="text-xs text-gray-700 mt-0.5">
                                    {{ reply.content }}
                                </p>

                                <div
                                    class="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <template v-if="isOwnComment(reply)">
                                        <button
                                            @click="startEdit(reply)"
                                            class="text-xs text-gray-400 hover:text-gray-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            @click="handleDelete(reply.id)"
                                            class="text-xs text-gray-400 hover:text-red-500"
                                        >
                                            Delete
                                        </button>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
