import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type {
    IntakeForm,
    IntakeFormSubmission,
    CreateIntakeFormRequest,
    UpdateIntakeFormRequest
} from '@/types/intakeForm'

export const useIntakeFormsStore = defineStore('intakeForms', () => {
    const forms = ref<IntakeForm[]>([])
    const currentForm = ref<IntakeForm | null>(null)
    const submissions = ref<IntakeFormSubmission[]>([])
    const loading = ref(false)

    async function fetchForms(): Promise<IntakeForm[]> {
        loading.value = true
        try {
            const { data } = await api.get<IntakeForm[]>('/intake-forms')
            forms.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    async function fetchForm(id: number): Promise<IntakeForm> {
        const { data } = await api.get<IntakeForm>(`/intake-forms/${id}`)
        currentForm.value = data
        return data
    }

    async function createForm(req: CreateIntakeFormRequest): Promise<IntakeForm> {
        const { data } = await api.post<IntakeForm>('/intake-forms', req)
        forms.value.push(data)
        return data
    }

    async function updateForm(id: number, req: UpdateIntakeFormRequest): Promise<IntakeForm> {
        const { data } = await api.put<IntakeForm>(`/intake-forms/${id}`, req)
        const index = forms.value.findIndex((f) => f.id === id)
        if (index !== -1) forms.value[index] = data
        if (currentForm.value?.id === id) currentForm.value = data
        return data
    }

    async function deleteForm(id: number): Promise<void> {
        await api.delete(`/intake-forms/${id}`)
        forms.value = forms.value.filter((f) => f.id !== id)
        if (currentForm.value?.id === id) currentForm.value = null
    }

    async function fetchSubmissions(formId: number): Promise<IntakeFormSubmission[]> {
        const { data } = await api.get<IntakeFormSubmission[]>(`/intake-forms/${formId}/submissions`)
        submissions.value = data
        return data
    }

    return {
        forms,
        currentForm,
        submissions,
        loading,
        fetchForms,
        fetchForm,
        createForm,
        updateForm,
        deleteForm,
        fetchSubmissions
    }
})
