import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clausesApi } from '@/services/api'
import type { Clause, ClauseSummary, ClauseVersion, CreateClauseRequest, UpdateClauseRequest } from '@/types/clause'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export const useClausesStore = defineStore('clauses', () => {
    const clauses = ref<ClauseSummary[]>([])
    const currentClause = ref<Clause | null>(null)
    const versions = ref<ClauseVersion[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const lastFetched = ref<number | null>(null)

    async function fetchClauses(workspaceId?: string, force = false): Promise<ClauseSummary[]> {
        if (!force && lastFetched.value !== null && Date.now() - lastFetched.value < CACHE_TTL_MS) {
            return clauses.value
        }
        loading.value = true
        error.value = null
        try {
            const { data } = await clausesApi.list(workspaceId)
            clauses.value = data
            lastFetched.value = Date.now()
            return data
        } catch {
            error.value = 'Failed to load clauses.'
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchClause(id: string): Promise<Clause | null> {
        error.value = null
        try {
            const { data } = await clausesApi.get(id)
            currentClause.value = data
            return data
        } catch {
            error.value = 'Failed to load clause.'
            return null
        }
    }

    async function createClause(req: CreateClauseRequest): Promise<Clause> {
        const { data } = await clausesApi.create(req)
        clauses.value.push({
            id: data.id,
            title: data.title,
            category: data.category,
            tags: data.tags,
            isPublic: data.isPublic,
            version: data.version
        })
        return data
    }

    async function updateClause(id: string, req: UpdateClauseRequest): Promise<Clause> {
        const { data } = await clausesApi.update(id, req)
        const index = clauses.value.findIndex((c) => c.id === id)
        if (index !== -1) {
            clauses.value[index] = {
                id: data.id,
                title: data.title,
                category: data.category,
                tags: data.tags,
                isPublic: data.isPublic,
                version: data.version
            }
        }
        if (currentClause.value?.id === id) currentClause.value = data
        return data
    }

    async function deleteClause(id: string): Promise<void> {
        await clausesApi.delete(id)
        clauses.value = clauses.value.filter((c) => c.id !== id)
        if (currentClause.value?.id === id) currentClause.value = null
    }

    async function fetchVersions(id: string): Promise<ClauseVersion[]> {
        const { data } = await clausesApi.getVersions(id)
        versions.value = data
        return data
    }

    return {
        clauses,
        currentClause,
        versions,
        loading,
        error,
        lastFetched,
        fetchClauses,
        fetchClause,
        createClause,
        updateClause,
        deleteClause,
        fetchVersions
    }
})
