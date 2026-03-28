<script setup lang="ts">
import { ref } from 'vue'
import { useApprovalsStore } from '@/stores/approvals'

const props = defineProps<{ documentId: number }>()
const emit = defineEmits<{ close: []; submitted: [] }>()

const approvalsStore = useApprovalsStore()

const emailInput = ref('')
const emails = ref<string[]>([])
const message = ref('')
const errorMsg = ref('')
const isSubmitting = ref(false)

function addEmail(): void {
    const val = emailInput.value.trim()
    if (!val) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errorMsg.value = 'Please enter a valid email address.'
        return
    }
    if (emails.value.includes(val)) {
        errorMsg.value = 'Email already added.'
        return
    }
    emails.value.push(val)
    emailInput.value = ''
    errorMsg.value = ''
}

function removeEmail(email: string): void {
    emails.value = emails.value.filter((e) => e !== email)
}

function handleEmailKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
        event.preventDefault()
        addEmail()
    }
}

async function handleSubmit(): Promise<void> {
    if (emails.value.length === 0) {
        errorMsg.value = 'Add at least one reviewer email.'
        return
    }
    isSubmitting.value = true
    errorMsg.value = ''
    try {
        await approvalsStore.createRequest(props.documentId, {
            reviewerEmails: emails.value,
            message: message.value.trim() || undefined
        })
        emit('submitted')
        emit('close')
    } catch {
        errorMsg.value = 'Failed to send approval request. Please try again.'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        @click.self="emit('close')"
    >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
                <span class="text-sm font-semibold text-gray-900">
                    Request Approval
                </span>
                <button
                    @click="emit('close')"
                    class="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Close"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-5 space-y-4">
                <!-- Email input -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Reviewer emails
                        <span class="text-red-400 ml-0.5">*</span>
                    </label>
                    <!-- Chips -->
                    <div v-if="emails.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                        <span
                            v-for="email in emails"
                            :key="email"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700"
                        >
                            {{ email }}
                            <button
                                @click="removeEmail(email)"
                                class="text-gray-400 hover:text-gray-700"
                                :aria-label="`Remove ${email}`"
                            >
                                <svg
                                    class="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <input
                            v-model="emailInput"
                            type="email"
                            placeholder="reviewer@example.com"
                            class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            @keydown="handleEmailKeydown"
                        />
                        <button
                            @click="addEmail"
                            class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <p v-if="errorMsg" class="mt-1 text-xs text-red-500">
                        {{ errorMsg }}
                    </p>
                </div>

                <!-- Message -->
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                        Message
                        <span class="text-gray-400 ml-1">(optional)</span>
                    </label>
                    <textarea
                        v-model="message"
                        rows="3"
                        placeholder="Add context for the reviewers…"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
                <button
                    @click="emit('close')"
                    class="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
                >
                    Cancel
                </button>
                <button
                    @click="handleSubmit"
                    :disabled="isSubmitting || emails.length === 0"
                    class="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ isSubmitting ? 'Sending…' : 'Send Request' }}
                </button>
            </div>
        </div>
    </div>
</template>
