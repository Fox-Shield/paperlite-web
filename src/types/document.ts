export enum DocumentStatus {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Archived = 'ARCHIVED'
}

export interface DocumentVersionUserSummary {
    id: number
    name: string
    email: string
}

export interface DocumentVersion {
    id: number
    documentId: number
    versionNumber: number
    changeNote?: string
    createdBy: DocumentVersionUserSummary
    createdAt: string
    fieldValues: Record<string, string>
}

export interface Document {
    id: string
    title: string
    status: DocumentStatus
    workspaceId: string
    templateId?: string
    createdAt: string
    updatedAt: string
    createdBy: string
    currentVersion?: DocumentVersion
}

export interface CreateDocumentRequest {
    title: string
    workspaceId: string
    templateId?: string
    content?: string
}

export interface UpdateDocumentRequest {
    title?: string
    status?: DocumentStatus
    content?: string
}
