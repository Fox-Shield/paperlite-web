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

// Handle 401 — clear auth and redirect
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
        }
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
    update: (id: number, req: UpdateIntakeFormRequest) =>
        api.put<IntakeForm>(`/intake-forms/${id}`, req),
    remove: (id: number) => api.delete(`/intake-forms/${id}`),
    submissions: (formId: number) =>
        api.get<IntakeFormSubmission[]>(`/intake-forms/${formId}/submissions`)
}

// ── Public Intake Form (no auth required) ────────────────────────────────────

export const publicIntakeApi = {
    getForm: (formId: number) =>
        publicApi.get<PublicIntakeForm>(`/public/intake/${formId}`),
    start: (formId: number) =>
        publicApi.post<StartSubmissionResponse>(`/public/intake/${formId}/start`),
    save: (formId: number, sessionToken: string, values: { fieldId: number; value: string }[]) =>
        publicApi.put(`/public/intake/${formId}/save`, { sessionToken, values }),
    submit: (formId: number, req: SubmitIntakeFormRequest) =>
        publicApi.post(`/public/intake/${formId}/submit`, req),
    resume: (formId: number, token: string) =>
        publicApi.get<{ values: { fieldId: number; value: string }[] }>(
            `/public/intake/${formId}/resume/${token}`
        )
}

export default api
