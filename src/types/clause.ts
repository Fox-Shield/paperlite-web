export interface Clause {
    id: string
    title: string
    content: string
    description?: string
    category: string
    tags: string[]
    isPublic: boolean
    version: number
    workspaceId?: string
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface ClauseSummary {
    id: string
    title: string
    category: string
    tags: string[]
    isPublic: boolean
    version: number
}

export interface ClauseVersion {
    id: string
    clauseId: string
    versionNumber: number
    content: string
    changeNote?: string
    createdBy: string
    createdAt: string
}

export interface TemplateClause {
    id: string
    templateId: string
    clauseId: string
    clause: ClauseSummary
    sectionName: string
    sortOrder: number
}

export interface CreateClauseRequest {
    title: string
    content: string
    description?: string
    category: string
    tags: string[]
    isPublic: boolean
}

export interface UpdateClauseRequest {
    title?: string
    content?: string
    description?: string
    category?: string
    tags?: string[]
    isPublic?: boolean
    changeNote?: string
}

export interface InsertClauseRequest {
    clauseId: string
    sectionName: string
    sortOrder: number
}
