import type { UserSummary } from './collaboration'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
export type ApprovalDecision = 'APPROVED' | 'REJECTED'

export interface ApprovalReview {
    id: number
    reviewer: UserSummary
    decision: ApprovalDecision
    comment?: string
    reviewedAt: string
}

export interface ApprovalRequest {
    id: number
    documentId: number
    documentTitle: string
    requestedBy: UserSummary
    status: ApprovalStatus
    message?: string
    reviews: ApprovalReview[]
    createdAt: string
}

export interface CreateApprovalRequestDTO {
    reviewerEmails: string[]
    message?: string
}

export interface SubmitReviewDTO {
    decision: ApprovalDecision
    comment?: string
}
