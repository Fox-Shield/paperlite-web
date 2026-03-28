import axios, { type AxiosError } from 'axios'
import type {
    IntakeForm,
    IntakeFormSubmission,
    CreateIntakeFormRequest,
    UpdateIntakeFormRequest,
    PublicIntakeForm,
    StartSubmissionResponse,
    SubmitIntakeFormRequest
} from '@/types/intakeForm'
import type {
    Clause,
    ClauseSummary,
    ClauseVersion,
    TemplateClause,
    CreateClauseRequest,
    UpdateClauseRequest,
    InsertClauseRequest
} from '@/types/clause'
import type {
    DocumentShare,
    DocumentWithShare,
    ShareDocumentRequest,
    SharePermission,
    Comment,
    CreateCommentRequest
} from '@/types/collaboration'
import type {
    SubscriptionPlan,
    UserSubscription,
    UsageRecord,
    Organization,
    OrganizationMember,
    OrgRole,
    BillingCycle
} from '@/types/subscription'
import type { DocumentVersion } from '@/types/document'
import type { ApprovalRequest, CreateApprovalRequestDTO, SubmitReviewDTO } from '@/types/approval'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Global response error handler
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status

        if (status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(error)
        }

        // Lazy-import toast store to avoid circular dependency at module init
        import('@/stores/toast').then(({ useToastStore }) => {
            const toast = useToastStore()
            if (status === 402) {
                toast.error("You've reached your plan limit. Upgrade to continue.", {
                    label: 'Upgrade',
                    href: '/settings/billing'
                })
            } else if (status === 429) {
                toast.warning('Too many requests. Please slow down.')
            } else if (status !== undefined && status >= 500) {
                toast.error('Something went wrong. Please try again.')
            }
        })

        return Promise.reject(error)
    }
)

// Public axios instance — no auth redirect
const publicApi = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
})

// ── Intake Forms (authenticated) ──────────────────────────────────────────────

export const intakeFormsApi = {
    list: () => api.get<IntakeForm[]>('/intake-forms'),
    get: (id: number) => api.get<IntakeForm>(`/intake-forms/${id}`),
    create: (req: CreateIntakeFormRequest) => api.post<IntakeForm>('/intake-forms', req),
    update: (id: number, req: UpdateIntakeFormRequest) => api.put<IntakeForm>(`/intake-forms/${id}`, req),
    remove: (id: number) => api.delete(`/intake-forms/${id}`),
    submissions: (formId: number) => api.get<IntakeFormSubmission[]>(`/intake-forms/${formId}/submissions`)
}

// ── Public Intake Form (no auth required) ────────────────────────────────────

export const publicIntakeApi = {
    getForm: (formId: number) => publicApi.get<PublicIntakeForm>(`/public/intake/${formId}`),
    start: (formId: number) => publicApi.post<StartSubmissionResponse>(`/public/intake/${formId}/start`),
    save: (formId: number, sessionToken: string, values: { fieldId: number; value: string }[]) =>
        publicApi.put(`/public/intake/${formId}/save`, { sessionToken, values }),
    submit: (formId: number, req: SubmitIntakeFormRequest) => publicApi.post(`/public/intake/${formId}/submit`, req),
    resume: (formId: number, token: string) =>
        publicApi.get<{ values: { fieldId: number; value: string }[] }>(`/public/intake/${formId}/resume/${token}`)
}

// ── Clauses (authenticated) ───────────────────────────────────────────────────

export const clausesApi = {
    list: (workspaceId?: string) =>
        api.get<ClauseSummary[]>('/clauses', { params: workspaceId ? { workspaceId } : undefined }),
    get: (id: string) => api.get<Clause>(`/clauses/${id}`),
    create: (data: CreateClauseRequest) => api.post<Clause>('/clauses', data),
    update: (id: string, data: UpdateClauseRequest) => api.put<Clause>(`/clauses/${id}`, data),
    delete: (id: string) => api.delete(`/clauses/${id}`),
    getVersions: (id: string) => api.get<ClauseVersion[]>(`/clauses/${id}/versions`),
    addToTemplate: (templateId: string, data: InsertClauseRequest) =>
        api.post<TemplateClause>(`/templates/${templateId}/clauses`, data),
    removeFromTemplate: (templateId: string, clauseId: string) =>
        api.delete(`/templates/${templateId}/clauses/${clauseId}`),
    getTemplateClauses: (templateId: string) => api.get<TemplateClause[]>(`/templates/${templateId}/clauses`)
}

// ── Shares (authenticated) ────────────────────────────────────────────────────

export const sharesApi = {
    getShares: (documentId: string) => api.get<DocumentShare[]>(`/documents/${documentId}/shares`),
    shareDocument: (documentId: string, data: ShareDocumentRequest) =>
        api.post<DocumentShare>(`/documents/${documentId}/shares`, data),
    updatePermission: (documentId: string, shareId: string, permission: SharePermission) =>
        api.put<DocumentShare>(`/documents/${documentId}/shares/${shareId}`, { permission }),
    revokeShare: (documentId: string, shareId: string) => api.delete(`/documents/${documentId}/shares/${shareId}`),
    getSharedWithMe: () => api.get<DocumentWithShare[]>('/documents/shared-with-me')
}

// ── Comments (authenticated) ──────────────────────────────────────────────────

export const commentsApi = {
    getComments: (documentId: string) => api.get<Comment[]>(`/documents/${documentId}/comments`),
    addComment: (documentId: string, data: CreateCommentRequest) =>
        api.post<Comment>(`/documents/${documentId}/comments`, data),
    updateComment: (documentId: string, commentId: string, data: CreateCommentRequest) =>
        api.put<Comment>(`/documents/${documentId}/comments/${commentId}`, data),
    deleteComment: (documentId: string, commentId: string) =>
        api.delete(`/documents/${documentId}/comments/${commentId}`)
}

// ── Subscriptions (authenticated) ─────────────────────────────────────────────

export const subscriptionApi = {
    getPlans: () => api.get<SubscriptionPlan[]>('/subscriptions/plans'),
    getMy: () => api.get<UserSubscription>('/subscriptions/my'),
    createCheckout: (planId: number, billingCycle: BillingCycle) =>
        api.post<{ checkoutUrl: string }>('/subscriptions/checkout', { planId, billingCycle }),
    createPortal: () => api.post<{ portalUrl: string }>('/subscriptions/portal')
}

// ── Usage (authenticated) ──────────────────────────────────────────────────────

export const usageApi = {
    getUsage: () => api.get<UsageRecord>('/usage')
}

// ── Organizations (authenticated) ─────────────────────────────────────────────

export const organizationApi = {
    getAll: () => api.get<Organization[]>('/organizations'),
    get: (id: number) => api.get<Organization>(`/organizations/${id}`),
    create: (name: string) => api.post<Organization>('/organizations', { name }),
    invite: (orgId: number, email: string, role: OrgRole) =>
        api.post<OrganizationMember>(`/organizations/${orgId}/invite`, { email, role }),
    removeMember: (orgId: number, userId: number) => api.delete(`/organizations/${orgId}/members/${userId}`),
    updateMemberRole: (orgId: number, userId: number, role: OrgRole) =>
        api.put<OrganizationMember>(`/organizations/${orgId}/members/${userId}/role`, { role })
}

// ── Document Versions (authenticated) ────────────────────────────────────────

export const documentsApi = {
    getVersions: (documentId: number) => api.get<DocumentVersion[]>(`/documents/${documentId}/versions`),
    getVersion: (documentId: number, versionId: number) =>
        api.get<DocumentVersion>(`/documents/${documentId}/versions/${versionId}`),
    compareVersions: (documentId: number, versionIdA: number, versionIdB: number) =>
        api.get(`/documents/${documentId}/versions/compare`, { params: { a: versionIdA, b: versionIdB } }),
    restoreVersion: (documentId: number, versionId: number) =>
        api.post(`/documents/${documentId}/versions/${versionId}/restore`)
}

// ── Approvals (authenticated) ─────────────────────────────────────────────────

export const approvalsApi = {
    getForDocument: (documentId: number) => api.get<ApprovalRequest[]>(`/documents/${documentId}/approvals`),
    create: (documentId: number, data: CreateApprovalRequestDTO) =>
        api.post<ApprovalRequest>(`/documents/${documentId}/approvals`, data),
    getRequest: (documentId: number, requestId: number) =>
        api.get<ApprovalRequest>(`/documents/${documentId}/approvals/${requestId}`),
    submitReview: (documentId: number, requestId: number, data: SubmitReviewDTO) =>
        api.post<ApprovalRequest>(`/documents/${documentId}/approvals/${requestId}/review`, data),
    withdraw: (documentId: number, requestId: number) => api.delete(`/documents/${documentId}/approvals/${requestId}`),
    getMyPending: () => api.get<ApprovalRequest[]>('/approvals/pending')
}

export default api
