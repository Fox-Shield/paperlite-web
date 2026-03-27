export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'FREE'
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type BillingCycle = 'MONTHLY' | 'YEARLY'

export interface SubscriptionPlan {
    id: number
    name: string
    tier: PlanTier
    priceMonthly: number
    priceYearly: number
    maxDocuments: number
    maxTemplates: number
    maxWorkspaceMembers: number
    stripePriceIdMonthly: string
    stripePriceIdYearly: string
}

export interface UserSubscription {
    id: number
    plan: SubscriptionPlan
    status: SubscriptionStatus
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
}

export interface UsageRecord {
    documentsCreated: number
    templatesCreated: number
    pdfGenerated: number
    intakeFormsCreated: number
    periodStart: string
    periodEnd: string
}

export interface Organization {
    id: number
    name: string
    slug: string
    ownerId: number
    members: OrganizationMember[]
    createdAt: string
}

export interface OrganizationMember {
    id: number
    userId?: number
    name?: string
    email: string
    role: OrgRole
    inviteAccepted: boolean
    joinedAt?: string
}
