<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const totalSteps = 4
const workspaceName = ref(`${authStore.user?.firstName ?? 'My'}'s workspace`)
const isCreatingWorkspace = ref(false)

const selectedTemplate = ref<string | null>(null)

const templates = [
    {
        id: 'nda',
        title: 'Non-Disclosure Agreement',
        description: 'Protect confidential information between parties',
        icon: '🔒'
    },
    {
        id: 'service',
        title: 'Service Agreement',
        description: 'Define scope of work and payment terms',
        icon: '🤝'
    },
    {
        id: 'employment',
        title: 'Employment Contract',
        description: 'Formalize employment terms and conditions',
        icon: '💼'
    },
    {
        id: 'lease',
        title: 'Lease Agreement',
        description: 'Residential or commercial property rental',
        icon: '🏠'
    }
]

const progressPercent = computed(() => ((step.value - 1) / (totalSteps - 1)) * 100)

function skip(): void {
    completeOnboarding()
}

async function handleCreateWorkspace(): Promise<void> {
    if (!workspaceName.value.trim()) return
    isCreatingWorkspace.value = true
    try {
        await api.post('/workspaces', { name: workspaceName.value.trim() })
    } catch {
        // workspace creation failure is non-blocking — proceed anyway
    } finally {
        isCreatingWorkspace.value = false
    }
    step.value = 3
}

function handleSelectTemplate(id: string): void {
    selectedTemplate.value = id
    step.value = 4
}

function handleScratch(): void {
    selectedTemplate.value = null
    step.value = 4
}

function completeOnboarding(): void {
    localStorage.setItem('onboarding_complete', 'true')
    router.push('/dashboard')
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-lg">
            <!-- Progress bar -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-gray-500"
                        >Step {{ step }} of {{ totalSteps }}</span
                    >
                    <button
                        @click="skip"
                        class="text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
                    >
                        Skip setup
                    </button>
                </div>
                <div
                    class="h-1.5 bg-gray-200 rounded-full overflow-hidden"
                    role="progressbar"
                    :aria-valuenow="step"
                    :aria-valuemin="1"
                    :aria-valuemax="totalSteps"
                    :aria-label="`Step ${step} of ${totalSteps}`"
                >
                    <div
                        class="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        :style="{ width: progressPercent + '%' }"
                    />
                </div>
                <!-- Step dots -->
                <div class="flex justify-between mt-2">
                    <div
                        v-for="s in totalSteps"
                        :key="s"
                        class="w-2 h-2 rounded-full transition-colors"
                        :class="s <= step ? 'bg-indigo-600' : 'bg-gray-200'"
                        :aria-hidden="true"
                    />
                </div>
            </div>

            <!-- Step 1: Welcome -->
            <Transition name="step" mode="out-in">
                <div
                    v-if="step === 1"
                    key="step1"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
                >
                    <div
                        class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    >
                        <svg
                            class="w-8 h-8 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="1.5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-3">
                        Welcome to PaperLite
                    </h1>
                    <p
                        class="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                    >
                        Create, manage, and generate professional documents in minutes.
                        Let's get your workspace ready.
                    </p>
                    <button
                        @click="step = 2"
                        class="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                    >
                        Let's get started
                    </button>
                </div>
            </Transition>

            <!-- Step 2: Create workspace -->
            <Transition name="step" mode="out-in">
                <div
                    v-if="step === 2"
                    key="step2"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <h2 class="text-xl font-bold text-gray-900 mb-1">
                        Name your workspace
                    </h2>
                    <p class="text-sm text-gray-500 mb-6">
                        This is where your documents and templates will live.
                    </p>
                    <label
                        for="workspace-name"
                        class="block text-sm font-medium text-gray-700 mb-1.5"
                        >Workspace name</label
                    >
                    <input
                        id="workspace-name"
                        v-model="workspaceName"
                        type="text"
                        placeholder="e.g. Acme Legal"
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-6"
                        @keydown.enter="handleCreateWorkspace"
                        autofocus
                    />
                    <button
                        @click="handleCreateWorkspace"
                        :disabled="!workspaceName.trim() || isCreatingWorkspace"
                        class="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ isCreatingWorkspace ? 'Creating…' : 'Continue' }}
                    </button>
                </div>
            </Transition>

            <!-- Step 3: Choose template -->
            <Transition name="step" mode="out-in">
                <div
                    v-if="step === 3"
                    key="step3"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                >
                    <h2 class="text-xl font-bold text-gray-900 mb-1">
                        Start with a template
                    </h2>
                    <p class="text-sm text-gray-500 mb-6">
                        Pick a starter or begin from scratch.
                    </p>
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <button
                            v-for="tmpl in templates"
                            :key="tmpl.id"
                            @click="handleSelectTemplate(tmpl.id)"
                            class="text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all group"
                        >
                            <div class="text-2xl mb-2">{{ tmpl.icon }}</div>
                            <p
                                class="text-sm font-semibold text-gray-900 mb-0.5 group-hover:text-indigo-700"
                            >
                                {{ tmpl.title }}
                            </p>
                            <p class="text-xs text-gray-500 leading-snug">
                                {{ tmpl.description }}
                            </p>
                        </button>
                    </div>
                    <button
                        @click="handleScratch"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
                    >
                        Start from scratch
                    </button>
                </div>
            </Transition>

            <!-- Step 4: Done -->
            <Transition name="step" mode="out-in">
                <div
                    v-if="step === 4"
                    key="step4"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
                >
                    <div
                        class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    >
                        <svg
                            class="w-8 h-8 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="1.5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-3">You're all set!</h2>
                    <p class="text-sm text-gray-500 mb-8">
                        Your workspace is ready. Start creating documents or invite your
                        team.
                    </p>
                    <div class="flex flex-col gap-3">
                        <button
                            @click="completeOnboarding"
                            class="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                        >
                            Create a document
                        </button>
                        <button
                            @click="completeOnboarding"
                            class="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors"
                        >
                            Invite team members
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
    transition: all 0.2s ease;
}
.step-enter-from {
    opacity: 0;
    transform: translateX(24px);
}
.step-leave-to {
    opacity: 0;
    transform: translateX(-24px);
}
</style>
