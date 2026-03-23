<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { publicIntakeApi } from '@/services/api'
import type { PublicIntakeForm, IntakeFormField } from '@/types/intakeForm'

const route = useRoute()
const formId = computed(() => Number(route.params.formId))

// ── State ─────────────────────────────────────────────────────────────────────

const form = ref<PublicIntakeForm | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const fieldValues = ref<Record<number, string>>({})
const submitterName = ref('')
const submitterEmail = ref('')
const sessionToken = ref<string | null>(null)
const submissionId = ref<number | null>(null)

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const submitError = ref('')

const STORAGE_KEY = computed(() => `intake_token_${formId.value}`)

// ── Load form ─────────────────────────────────────────────────────────────────

async function loadForm(): Promise<void> {
    isLoading.value = true
    loadError.value = ''
    try {
        const { data } = await publicIntakeApi.getForm(formId.value)
        form.value = data

        // init field values
        data.fields.forEach((f) => {
            fieldValues.value[f.id] = ''
        })

        // try to resume from localStorage
        const storedToken = localStorage.getItem(STORAGE_KEY.value)
        if (storedToken && data.allowSaveResume) {
            await tryResume(storedToken)
        } else {
            // start a new session
            await startSession()
        }
    } catch {
        loadError.value = 'This form could not be loaded.'
    } finally {
        isLoading.value = false
    }
}

async function startSession(): Promise<void> {
    try {
        const { data } = await publicIntakeApi.start(formId.value)
        sessionToken.value = data.sessionToken
        submissionId.value = data.submissionId
        if (form.value?.allowSaveResume) {
            localStorage.setItem(STORAGE_KEY.value, data.sessionToken)
        }
    } catch {
        // non-fatal — submit will fail with a helpful error
    }
}

async function tryResume(token: string): Promise<void> {
    try {
        const { data } = await publicIntakeApi.resume(formId.value, token)
        sessionToken.value = token
        data.values.forEach(({ fieldId, value }) => {
            fieldValues.value[fieldId] = value
        })
    } catch {
        // resume failed — start fresh
        localStorage.removeItem(STORAGE_KEY.value)
        await startSession()
    }
}

// ── Auto-save ─────────────────────────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | null = null
const isSaving = ref(false)

function scheduleAutoSave(): void {
    if (!form.value?.allowSaveResume || !sessionToken.value) return
    if (saveTimer !== null) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
        isSaving.value = true
        try {
            await publicIntakeApi.save(formId.value, sessionToken.value!, buildValues())
        } finally {
            isSaving.value = false
            saveTimer = null
        }
    }, 1500)
}

watch(fieldValues, scheduleAutoSave, { deep: true })

// ── Conditional visibility ────────────────────────────────────────────────────

function isFieldVisible(field: IntakeFormField): boolean {
    if (!field.isConditional || !field.conditionalFieldId) return true
    const trigger = form.value?.fields.find(
        (f) => f.templateFieldId === field.conditionalFieldId
    )
    if (!trigger) return true
    return fieldValues.value[trigger.id] === field.conditionalValue
}

// ── Submit ────────────────────────────────────────────────────────────────────

function buildValues(): { fieldId: number; value: string }[] {
    return Object.entries(fieldValues.value).map(([id, value]) => ({
        fieldId: Number(id),
        value
    }))
}

async function handleSubmit(): Promise<void> {
    submitError.value = ''
    if (!submitterName.value.trim()) {
        submitError.value = 'Please enter your name.'
        return
    }
    if (!submitterEmail.value.trim()) {
        submitError.value = 'Please enter your email.'
        return
    }
    if (!sessionToken.value) {
        submitError.value = 'Session error. Please refresh and try again.'
        return
    }

    // Validate required visible fields
    const missing = form.value?.fields.filter(
        (f) => f.isRequired && isFieldVisible(f) && !fieldValues.value[f.id]?.trim()
    )
    if (missing && missing.length > 0) {
        submitError.value = `Please fill in: ${missing.map((f) => f.label).join(', ')}`
        return
    }

    isSubmitting.value = true
    try {
        await publicIntakeApi.submit(formId.value, {
            sessionToken: sessionToken.value,
            submitterName: submitterName.value,
            submitterEmail: submitterEmail.value,
            values: buildValues()
        })
        localStorage.removeItem(STORAGE_KEY.value)
        isSubmitted.value = true
    } catch {
        submitError.value = 'Submission failed. Please try again.'
    } finally {
        isSubmitting.value = false
    }
}

onMounted(loadForm)

// ── Helpers ───────────────────────────────────────────────────────────────────

const accentStyle = computed(() => ({
    '--accent': form.value?.brandingColor ?? '#4f46e5'
}))
</script>

<template>
    <div
        class="min-h-screen bg-gray-50 flex flex-col
            items-center py-10 px-4"
        :style="accentStyle"
    >
        <!-- Loading -->
        <div
            v-if="isLoading"
            class="w-full max-w-xl space-y-4"
        >
            <div
                class="h-24 bg-white rounded-2xl border
                    border-gray-100 animate-pulse"
            />
            <div
                class="h-48 bg-white rounded-2xl border
                    border-gray-100 animate-pulse"
            />
        </div>

        <!-- Error -->
        <div
            v-else-if="loadError"
            class="w-full max-w-xl text-center py-24"
        >
            <p class="text-sm text-red-500">{{ loadError }}</p>
        </div>

        <!-- Success -->
        <div
            v-else-if="isSubmitted"
            class="w-full max-w-xl"
        >
            <div
                class="bg-white rounded-2xl border border-gray-100
                    shadow-sm p-10 flex flex-col items-center
                    text-center"
            >
                <div
                    class="w-14 h-14 rounded-full flex items-center
                        justify-center mb-5"
                    style="background: var(--accent)"
                >
                    <svg
                        class="w-7 h-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h1
                    class="text-xl font-semibold text-gray-900 mb-2"
                >
                    Thank you, {{ submitterName }}!
                </h1>
                <p class="text-sm text-gray-500">
                    Your form has been submitted. We'll be in touch
                    soon.
                </p>
            </div>
        </div>

        <!-- Form -->
        <div
            v-else-if="form"
            class="w-full max-w-xl space-y-4"
        >
            <!-- Header card -->
            <div
                class="bg-white rounded-2xl border border-gray-100
                    shadow-sm overflow-hidden"
            >
                <div
                    class="h-2"
                    style="background: var(--accent)"
                />
                <div class="p-6">
                    <div
                        v-if="form.logoUrl"
                        class="mb-4"
                    >
                        <img
                            :src="form.logoUrl"
                            alt="Logo"
                            class="h-10 object-contain"
                        />
                    </div>
                    <h1
                        class="text-xl font-semibold text-gray-900"
                    >
                        {{ form.title }}
                    </h1>
                    <p
                        v-if="form.welcomeMessage"
                        class="mt-2 text-sm text-gray-500"
                    >
                        {{ form.welcomeMessage }}
                    </p>
                    <p
                        v-else-if="form.description"
                        class="mt-2 text-sm text-gray-500"
                    >
                        {{ form.description }}
                    </p>
                    <div
                        v-if="form.allowSaveResume"
                        class="mt-3 flex items-center gap-1.5"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0
                                    002 2h14a2 2 0 002-2V9a2 2 0
                                    00-2-2h-3m-1 4l-3 3m0 0l-3-3m3
                                    3V4"
                            />
                        </svg>
                        <span class="text-xs text-gray-400">
                            {{
                                isSaving
                                    ? 'Saving…'
                                    : 'Progress is saved automatically'
                            }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Fields card -->
            <div
                class="bg-white rounded-2xl border border-gray-100
                    shadow-sm p-6 space-y-5"
            >
                <template
                    v-for="field in form.fields"
                    :key="field.id"
                >
                    <div v-if="isFieldVisible(field)">
                        <label
                            class="block text-sm font-medium
                                text-gray-700 mb-1"
                        >
                            {{ field.label }}
                            <span
                                v-if="field.isRequired"
                                class="text-red-400 ml-0.5"
                            >
                                *
                            </span>
                        </label>
                        <p
                            v-if="field.helpText"
                            class="text-xs text-gray-400 mb-1.5"
                        >
                            {{ field.helpText }}
                        </p>

                        <!-- TEXT -->
                        <input
                            v-if="field.fieldType === 'TEXT'"
                            v-model="fieldValues[field.id]"
                            type="text"
                            class="w-full rounded-xl border
                                border-gray-200 px-3.5 py-2.5 text-sm
                                focus:outline-none focus:ring-2
                                focus:border-transparent"
                            style="--tw-ring-color: var(--accent)"
                        />

                        <!-- NUMBER -->
                        <input
                            v-else-if="field.fieldType === 'NUMBER'"
                            v-model="fieldValues[field.id]"
                            type="number"
                            class="w-full rounded-xl border
                                border-gray-200 px-3.5 py-2.5 text-sm
                                focus:outline-none focus:ring-2
                                focus:border-transparent"
                            style="--tw-ring-color: var(--accent)"
                        />

                        <!-- DATE -->
                        <input
                            v-else-if="field.fieldType === 'DATE'"
                            v-model="fieldValues[field.id]"
                            type="date"
                            class="w-full rounded-xl border
                                border-gray-200 px-3.5 py-2.5 text-sm
                                focus:outline-none focus:ring-2
                                focus:border-transparent"
                            style="--tw-ring-color: var(--accent)"
                        />

                        <!-- BOOLEAN -->
                        <label
                            v-else-if="field.fieldType === 'BOOLEAN'"
                            class="flex items-center gap-2.5
                                cursor-pointer"
                        >
                            <input
                                v-model="fieldValues[field.id]"
                                type="checkbox"
                                true-value="true"
                                false-value="false"
                                class="w-4 h-4 rounded border-gray-300
                                    focus:ring-2"
                                style="
                                    accent-color: var(--accent);
                                    --tw-ring-color: var(--accent);
                                "
                            />
                            <span class="text-sm text-gray-600">
                                {{ field.label }}
                            </span>
                        </label>

                        <!-- TEXTAREA -->
                        <textarea
                            v-else-if="
                                field.fieldType === 'TEXTAREA'
                            "
                            v-model="fieldValues[field.id]"
                            rows="4"
                            class="w-full rounded-xl border
                                border-gray-200 px-3.5 py-2.5 text-sm
                                focus:outline-none focus:ring-2
                                focus:border-transparent resize-none"
                            style="--tw-ring-color: var(--accent)"
                        />

                        <!-- SELECT -->
                        <select
                            v-else-if="field.fieldType === 'SELECT'"
                            v-model="fieldValues[field.id]"
                            class="w-full rounded-xl border
                                border-gray-200 px-3.5 py-2.5 text-sm
                                focus:outline-none focus:ring-2
                                focus:border-transparent"
                            style="--tw-ring-color: var(--accent)"
                        >
                            <option value="" disabled>
                                Select…
                            </option>
                            <option
                                v-for="opt in field.options"
                                :key="opt"
                                :value="opt"
                            >
                                {{ opt }}
                            </option>
                        </select>
                    </div>
                </template>
            </div>

            <!-- Submitter info + submit -->
            <div
                class="bg-white rounded-2xl border border-gray-100
                    shadow-sm p-6 space-y-4"
            >
                <h2
                    class="text-sm font-semibold text-gray-700"
                >
                    Your details
                </h2>

                <div>
                    <label
                        class="block text-sm font-medium
                            text-gray-700 mb-1"
                    >
                        Full Name
                        <span class="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                        v-model="submitterName"
                        type="text"
                        placeholder="Jane Smith"
                        class="w-full rounded-xl border border-gray-200
                            px-3.5 py-2.5 text-sm focus:outline-none
                            focus:ring-2 focus:border-transparent"
                        style="--tw-ring-color: var(--accent)"
                    />
                </div>

                <div>
                    <label
                        class="block text-sm font-medium
                            text-gray-700 mb-1"
                    >
                        Email
                        <span class="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                        v-model="submitterEmail"
                        type="email"
                        placeholder="jane@example.com"
                        class="w-full rounded-xl border border-gray-200
                            px-3.5 py-2.5 text-sm focus:outline-none
                            focus:ring-2 focus:border-transparent"
                        style="--tw-ring-color: var(--accent)"
                    />
                </div>

                <p
                    v-if="submitError"
                    class="text-sm text-red-500"
                >
                    {{ submitError }}
                </p>

                <button
                    :disabled="isSubmitting"
                    class="w-full py-3 rounded-xl text-white
                        font-semibold text-sm transition-opacity
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: var(--accent)"
                    @click="handleSubmit"
                >
                    {{
                        isSubmitting
                            ? 'Submitting…'
                            : form.submitButtonText
                    }}
                </button>
            </div>
        </div>
    </div>
</template>
