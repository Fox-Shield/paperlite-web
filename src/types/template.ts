export enum FieldType {
    Text = 'TEXT',
    Number = 'NUMBER',
    Date = 'DATE',
    Boolean = 'BOOLEAN',
    Select = 'SELECT'
}

export interface TemplateField {
    id: string
    name: string
    label: string
    type: FieldType
    required: boolean
    defaultValue?: string
    options?: string[]
}

export interface Template {
    id: string
    name: string
    description?: string
    workspaceId: string
    fields: TemplateField[]
    createdAt: string
    updatedAt: string
    createdBy: string
}

export interface CreateTemplateRequest {
    name: string
    description?: string
    workspaceId: string
    fields?: Omit<TemplateField, 'id'>[]
}

export interface UpdateTemplateRequest {
    name?: string
    description?: string
    fields?: Omit<TemplateField, 'id'>[]
}
