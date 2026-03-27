import { defineStore } from 'pinia'
import { ref } from 'vue'
import { organizationApi } from '@/services/api'
import type { Organization, OrgRole } from '@/types/subscription'

export const useOrganizationStore = defineStore('organization', () => {
    const organizations = ref<Organization[]>([])
    const currentOrg = ref<Organization | null>(null)
    const loading = ref(false)

    async function fetchOrganizations(): Promise<void> {
        loading.value = true
        try {
            const { data } = await organizationApi.getAll()
            organizations.value = data
        } finally {
            loading.value = false
        }
    }

    async function fetchOrganization(id: number): Promise<void> {
        loading.value = true
        try {
            const { data } = await organizationApi.get(id)
            currentOrg.value = data
        } finally {
            loading.value = false
        }
    }

    async function createOrganization(name: string): Promise<void> {
        loading.value = true
        try {
            const { data } = await organizationApi.create(name)
            organizations.value.push(data)
            currentOrg.value = data
        } finally {
            loading.value = false
        }
    }

    async function inviteMember(orgId: number, email: string, role: OrgRole): Promise<void> {
        const { data } = await organizationApi.invite(orgId, email, role)
        if (currentOrg.value?.id === orgId) {
            currentOrg.value.members.push(data)
        }
    }

    async function removeMember(orgId: number, userId: number): Promise<void> {
        await organizationApi.removeMember(orgId, userId)
        if (currentOrg.value?.id === orgId) {
            currentOrg.value.members = currentOrg.value.members.filter((m) => m.userId !== userId)
        }
    }

    async function updateMemberRole(orgId: number, userId: number, role: OrgRole): Promise<void> {
        const { data } = await organizationApi.updateMemberRole(orgId, userId, role)
        if (currentOrg.value?.id === orgId) {
            const idx = currentOrg.value.members.findIndex((m) => m.userId === userId)
            if (idx !== -1) currentOrg.value.members[idx] = data
        }
    }

    return {
        organizations,
        currentOrg,
        loading,
        fetchOrganizations,
        fetchOrganization,
        createOrganization,
        inviteMember,
        removeMember,
        updateMemberRole
    }
})
