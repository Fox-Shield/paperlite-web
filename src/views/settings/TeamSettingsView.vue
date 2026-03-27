<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrganizationStore } from '@/stores/organization'
import { useAuthStore } from '@/stores/auth'
import type { OrgRole } from '@/types/subscription'

const store = useOrganizationStore()
const authStore = useAuthStore()

const inviteEmail = ref('')
const inviteRole = ref<OrgRole>('MEMBER')
const inviteLoading = ref(false)
const inviteError = ref('')
const showInviteForm = ref(false)

const org = computed(() => store.currentOrg ?? store.organizations[0] ?? null)
const currentUserId = computed(() => authStore.user?.id)
const isOwner = computed(() =>
    org.value ? org.value.ownerId === currentUserId.value : false
)

const acceptedMembers = computed(
    () => org.value?.members.filter((m) => m.inviteAccepted) ?? []
)
const pendingMembers = computed(
    () => org.value?.members.filter((m) => !m.inviteAccepted) ?? []
)

onMounted(async () => {
    await store.fetchOrganizations()
    if (store.organizations[0]) {
        await store.fetchOrganization(store.organizations[0].id)
    }
})

async function handleInvite(): Promise<void> {
    if (!org.value || !inviteEmail.value.trim()) return
    inviteLoading.value = true
    inviteError.value = ''
    try {
        await store.inviteMember(org.value.id, inviteEmail.value.trim(), inviteRole.value)
        inviteEmail.value = ''
        inviteRole.value = 'MEMBER'
        showInviteForm.value = false
    } catch {
        inviteError.value = 'Failed to send invite.'
    } finally {
        inviteLoading.value = false
    }
}

async function handleRemove(userId: number): Promise<void> {
    if (!org.value) return
    await store.removeMember(org.value.id, userId)
}

async function handleRoleChange(userId: number, role: OrgRole): Promise<void> {
    if (!org.value) return
    await store.updateMemberRole(org.value.id, userId, role)
}

const roleBadgeClass: Record<OrgRole, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-gray-100 text-gray-600'
}

function initials(name?: string, email?: string): string {
    if (name) return name.slice(0, 2).toUpperCase()
    return email?.slice(0, 2).toUpperCase() ?? '??'
}
</script>

<template>
    <div class="max-w-2xl space-y-6">
        <div v-if="store.loading" class="text-sm text-gray-400">Loading...</div>

        <div v-else-if="!org" class="text-sm text-gray-500">
            No organization found. Create one in the Organization tab first.
        </div>

        <template v-else>
            <!-- Members table -->
            <section>
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-sm font-semibold text-gray-900">Members</h2>
                    <button
                        class="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
                        @click="showInviteForm = !showInviteForm"
                    >
                        Invite member
                    </button>
                </div>

                <!-- Invite form -->
                <div
                    v-if="showInviteForm"
                    class="border border-gray-200 rounded-xl p-4 mb-4 space-y-3"
                >
                    <div class="flex gap-2">
                        <input
                            v-model="inviteEmail"
                            type="email"
                            placeholder="Email address"
                            class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                        <select
                            v-model="inviteRole"
                            class="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="MEMBER">Member</option>
                        </select>
                        <button
                            class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            :disabled="inviteLoading || !inviteEmail.trim()"
                            @click="handleInvite"
                        >
                            Send
                        </button>
                    </div>
                    <p v-if="inviteError" class="text-xs text-red-500">
                        {{ inviteError }}
                    </p>
                </div>

                <!-- Member rows -->
                <div class="border border-gray-200 rounded-xl overflow-hidden">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 bg-gray-50">
                                <th
                                    class="px-4 py-2.5 text-left text-xs font-medium text-gray-500"
                                >
                                    Member
                                </th>
                                <th
                                    class="px-4 py-2.5 text-left text-xs font-medium text-gray-500"
                                >
                                    Role
                                </th>
                                <th v-if="isOwner" class="px-4 py-2.5" />
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="member in acceptedMembers"
                                :key="member.id"
                                class="border-b border-gray-100 last:border-0"
                            >
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                                        >
                                            {{ initials(member.name, member.email) }}
                                        </div>
                                        <div>
                                            <p
                                                v-if="member.name"
                                                class="font-medium text-gray-900"
                                            >
                                                {{ member.name }}
                                            </p>
                                            <p class="text-xs text-gray-500">
                                                {{ member.email }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        v-if="member.role === 'OWNER' || !isOwner"
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="roleBadgeClass[member.role]"
                                    >
                                        {{ member.role }}
                                    </span>
                                    <select
                                        v-else
                                        :value="member.role"
                                        class="border border-gray-200 rounded-md px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        @change="
                                            (e) =>
                                                handleRoleChange(
                                                    member.userId!,
                                                    (e.target as HTMLSelectElement)
                                                        .value as OrgRole
                                                )
                                        "
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="MEMBER">Member</option>
                                    </select>
                                </td>
                                <td v-if="isOwner" class="px-4 py-3 text-right">
                                    <button
                                        v-if="member.role !== 'OWNER'"
                                        class="text-xs text-red-500 hover:text-red-700"
                                        @click="
                                            member.userId && handleRemove(member.userId)
                                        "
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Pending invites -->
            <section v-if="pendingMembers.length > 0">
                <h2 class="text-sm font-semibold text-gray-900 mb-3">Pending invites</h2>
                <div class="border border-gray-200 rounded-xl overflow-hidden">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 bg-gray-50">
                                <th
                                    class="px-4 py-2.5 text-left text-xs font-medium text-gray-500"
                                >
                                    Email
                                </th>
                                <th
                                    class="px-4 py-2.5 text-left text-xs font-medium text-gray-500"
                                >
                                    Role
                                </th>
                                <th v-if="isOwner" class="px-4 py-2.5" />
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="member in pendingMembers"
                                :key="member.id"
                                class="border-b border-gray-100 last:border-0"
                            >
                                <td class="px-4 py-3 text-gray-600">
                                    {{ member.email }}
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="roleBadgeClass[member.role]"
                                    >
                                        {{ member.role }}
                                    </span>
                                </td>
                                <td v-if="isOwner" class="px-4 py-3 text-right space-x-2">
                                    <button
                                        class="text-xs text-gray-500 hover:text-gray-700"
                                        @click="
                                            store.inviteMember(
                                                org!.id,
                                                member.email,
                                                member.role
                                            )
                                        "
                                    >
                                        Resend
                                    </button>
                                    <button
                                        v-if="member.userId"
                                        class="text-xs text-red-500 hover:text-red-700"
                                        @click="handleRemove(member.userId)"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </template>
    </div>
</template>
