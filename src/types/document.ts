export enum DocumentStatus {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Archived = 'ARCHIVED'
}

export interface DocumentVersion {
    id: string
    documentId: string
    versionNumber: number
    content: string
    createdAt: string
    createdBy: string
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
