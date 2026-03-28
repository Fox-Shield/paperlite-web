export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'TEXTAREA' | 'SELECT'

export interface FieldValue {
    templateFieldId: number
    fieldName: string
    fieldType: FieldType
    value: string
    required?: boolean
    options?: string[]
}

export interface SaveFieldValuesRequest {
    fieldValues: { templateFieldId: number; value: string }[]
}

export interface GenerationRequest {
    id: number
    documentId: number
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    errorMessage?: string
    downloadUrl?: string
    createdAt: string
    completedAt?: string
}

export type DocumentStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'ERROR'

export type DocumentApprovalStatus = 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'

export interface Document {
    id: number
    name: string
    templateId: number
    templateName: string
    status: DocumentStatus
    approvalStatus?: DocumentApprovalStatus
    createdAt: string
    updatedAt?: string
}

export interface CreateDocumentRequest {
    name: string
    templateId: number
}

export interface Template {
    id: number
    name: string
    description?: string
}
