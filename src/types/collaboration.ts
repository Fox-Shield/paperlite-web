export type SharePermission = 'READ' | 'COMMENT' | 'WRITE'

export interface UserSummary {
    id: string
    name: string
    email: string
}

export interface DocumentShare {
    id: string
    documentId: string
    sharedWithUser: UserSummary
    permission: SharePermission
    createdAt: string
}

export interface Comment {
    id: string
    documentId: string
    author: UserSummary
    content: string
    parentCommentId?: string
    replies: Comment[]
    createdAt: string
    updatedAt: string
    isDeleted: boolean
}

export interface CreateCommentRequest {
    content: string
    parentCommentId?: string
}

export interface ShareDocumentRequest {
    email: string
    permission: SharePermission
}

export interface DocumentWithShare {
    id: string
    name: string
    updatedAt: string
    createdAt: string
    ownerName: string
    permission: SharePermission
}
