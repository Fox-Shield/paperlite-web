import type { FieldType } from './template'

export interface IntakeForm {
    id: number
    templateId: number
    workspaceId: number
    title: string
    description?: string
    welcomeMessage?: string
    submitButtonText: string
    isActive: boolean
    allowSaveResume: boolean
    brandingColor?: string
    logoUrl?: string
    fields: IntakeFormField[]
    createdAt: string
}

export interface IntakeFormField {
    id: number
    templateFieldId: number
    label: string
    helpText?: string
    isRequired: boolean
    isConditional: boolean
    conditionalFieldId?: number
    conditionalValue?: string
    sortOrder: number
    fieldType: FieldType
    options?: string[]
}

export interface IntakeFormSubmission {
    id: number
    formId: number
    submitterName: string
    submitterEmail: string
    status: 'DRAFT' | 'SUBMITTED' | 'PROCESSED'
    submittedAt?: string
    values: { fieldId: number; value: string }[]
}

export interface CreateIntakeFormRequest {
    templateId: number
    workspaceId: number
    title: string
    description?: string
    welcomeMessage?: string
    brandingColor?: string
    allowSaveResume: boolean
    fields: IntakeFormFieldConfig[]
}

export interface UpdateIntakeFormRequest {
    title?: string
    description?: string
    welcomeMessage?: string
    submitButtonText?: string
    isActive?: boolean
    allowSaveResume?: boolean
    brandingColor?: string
    logoUrl?: string
    fields?: IntakeFormFieldConfig[]
}

export interface IntakeFormFieldConfig {
    templateFieldId: number
    label: string
    helpText?: string
    isRequired: boolean
    isConditional: boolean
    conditionalFieldId?: number
    conditionalValue?: string
    sortOrder: number
}

export interface PublicIntakeForm {
    id: number
    title: string
    description?: string
    welcomeMessage?: string
    submitButtonText: string
    allowSaveResume: boolean
    brandingColor?: string
    logoUrl?: string
    fields: IntakeFormField[]
}

export interface StartSubmissionResponse {
    sessionToken: string
    submissionId: number
}

export interface SubmitIntakeFormRequest {
    sessionToken: string
    submitterName: string
    submitterEmail: string
    values: { fieldId: number; value: string }[]
}
