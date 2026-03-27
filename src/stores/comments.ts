import { defineStore } from 'pinia'
import { ref } from 'vue'
import { commentsApi } from '@/services/api'
import type { Comment, CreateCommentRequest } from '@/types/collaboration'

export const useCommentsStore = defineStore('comments', () => {
    const comments = ref<Comment[]>([])
    const loading = ref(false)

    async function fetchComments(documentId: string): Promise<void> {
        loading.value = true
        try {
            const { data } = await commentsApi.getComments(documentId)
            comments.value = data
        } finally {
            loading.value = false
        }
    }

    async function addComment(documentId: string, data: CreateCommentRequest): Promise<void> {
        const { data: comment } = await commentsApi.addComment(documentId, data)
        if (comment.parentCommentId) {
            const parent = comments.value.find((c) => c.id === comment.parentCommentId)
            if (parent) parent.replies.push(comment)
        } else {
            comments.value.push(comment)
        }
    }

    async function updateComment(documentId: string, commentId: string, data: CreateCommentRequest): Promise<void> {
        const { data: updated } = await commentsApi.updateComment(documentId, commentId, data)
        const index = comments.value.findIndex((c) => c.id === commentId)
        if (index !== -1) {
            comments.value[index] = updated
        } else {
            // check in replies
            for (const comment of comments.value) {
                const ri = comment.replies.findIndex((r) => r.id === commentId)
                if (ri !== -1) {
                    comment.replies[ri] = updated
                    break
                }
            }
        }
    }

    async function deleteComment(documentId: string, commentId: string): Promise<void> {
        await commentsApi.deleteComment(documentId, commentId)
        const index = comments.value.findIndex((c) => c.id === commentId)
        if (index !== -1) {
            comments.value.splice(index, 1)
        } else {
            for (const comment of comments.value) {
                const ri = comment.replies.findIndex((r) => r.id === commentId)
                if (ri !== -1) {
                    comment.replies.splice(ri, 1)
                    break
                }
            }
        }
    }

    function receiveRealtimeComment(comment: Comment): void {
        if (comment.parentCommentId) {
            const parent = comments.value.find((c) => c.id === comment.parentCommentId)
            if (parent && !parent.replies.find((r) => r.id === comment.id)) {
                parent.replies.push(comment)
            }
        } else if (!comments.value.find((c) => c.id === comment.id)) {
            comments.value.push(comment)
        }
    }

    return { comments, loading, fetchComments, addComment, updateComment, deleteComment, receiveRealtimeComment }
})
