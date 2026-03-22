import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Template, CreateTemplateRequest, UpdateTemplateRequest } from '@/types'

export const useTemplatesStore = defineStore('templates', () => {
    const templates = ref<Template[]>([])
    const loading = ref(false)

    async function fetchTemplates(workspaceId: string): Promise<Template[]> {
        loading.value = true
        try {
            const { data } = await api.get<Template[]>(`/workspaces/${workspaceId}/templates`)
            templates.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    async function createTemplate(payload: CreateTemplateRequest): Promise<Template> {
        const { data } = await api.post<Template>('/templates', payload)
        templates.value.push(data)
        return data
    }

    async function updateTemplate(id: string, payload: UpdateTemplateRequest): Promise<Template> {
        const { data } = await api.patch<Template>(`/templates/${id}`, payload)
        const index = templates.value.findIndex((t) => t.id === id)
        if (index !== -1) templates.value[index] = data
        return data
    }

    async function deleteTemplate(id: string): Promise<void> {
        await api.delete(`/templates/${id}`)
        templates.value = templates.value.filter((t) => t.id !== id)
    }

    return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate }
})
