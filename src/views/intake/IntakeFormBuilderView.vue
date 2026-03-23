<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIntakeFormsStore } from '@/stores/intakeForms'
import { useTemplatesStore } from '@/stores/templates'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import type { Template } from '@/types/template'
import type {
    IntakeFormField,
    IntakeFormFieldConfig,
    CreateIntakeFormRequest,
    UpdateIntakeFormRequest
} from '@/types/intakeForm'

const route = useRoute()
const router = useRouter()
const store = useIntakeFormsStore()
const templatesStore = useTemplatesStore()
const authStore = useAuthStore()

const isEditMode = computed(() => !!route.params.id)
const formId = computed(() => Number(route.params.id))

// ── Form settings ─────────────────────────────────────────────────────────────

const title = ref('')
const description = ref('')
const welcomeMessage = ref('')
const submitButtonText = ref('Submit')
const brandingColor = ref('#4f46e5')
const logoUrl = ref('')
const allowSaveResume = ref(false)
const selectedTemplateId = ref<number | null>(null)

// ── Templates list ────────────────────────────────────────────────────────────

const templates = ref<Template[]>([])
const loadingTemplates = ref(false)

async function loadTemplates(): Promise<void> {
    const workspaceId = authStore.user?.workspaceId
    if (!workspaceId) return
    loadingTemplates.value = true
    try {
        const { data } = await api.get<Template[]>(`/workspaces/${workspaceId}/templates`)
        templates.value = data
    } finally {
        loadingTemplates.value = false
    }
}

// ── Field configs ─────────────────────────────────────────────────────────────

interface FieldRow extends IntakeFormFieldConfig {
    fieldType: string
    options?: string[]
    _tempId: number
}

const fieldRows = ref<FieldRow[]>([])

const selectedTemplate = computed<Template | null>(
    () => templates.value.find((t) => t.id === String(selectedTemplateId.value)) ?? null
)

watch(selectedTemplate, (tpl) => {
    if (!tpl || isEditMode.value) return
    fieldRows.value = tpl.fields.map((f, idx) => ({
        _tempId: idx,
        templateFieldId: Number(f.id),
        label: f.label,
        helpText: '',
        isRequired: f.required,
        isConditional: false,
        conditionalFieldId: undefined,
        conditionalValue: '',
        sortOrder: idx,
        fieldType: f.type,
        options: f.options
    }))
})

// ── Load edit mode data ───────────────────────────────────────────────────────

const isSaving = ref(false)
const saveError = ref('')

async function loadForEdit(): Promise<void> {
    const form = await store.fetchForm(formId.value)
    title.value = form.title
    description.value = form.description ?? ''
    welcomeMessage.value = form.welcomeMessage ?? ''
    submitButtonText.value = form.submitButtonText
    brandingColor.value = form.brandingColor ?? '#4f46e5'
    logoUrl.value = form.logoUrl ?? ''
    allowSaveResume.value = form.allowSaveResume
    selectedTemplateId.value = form.templateId

    fieldRows.value = form.fields.map((f: IntakeFormField) => ({
        _tempId: f.id,
        templateFieldId: f.templateFieldId,
        label: f.label,
        helpText: f.helpText ?? '',
        isRequired: f.isRequired,
        isConditional: f.isConditional,
        conditionalFieldId: f.conditionalFieldId,
        conditionalValue: f.conditionalValue ?? '',
        sortOrder: f.sortOrder,
        fieldType: f.fieldType,
        options: f.options
    }))
}

onMounted(async () => {
    await loadTemplates()
    if (isEditMode.value) await loadForEdit()
})

// ── Drag-to-reorder ───────────────────────────────────────────────────────────

const dragging = ref<number | null>(null)

function onDragStart(idx: number): void {
    dragging.value = idx
}

function onDrop(targetIdx: number): void {
    if (dragging.value === null || dragging.value === targetIdx) return
    const rows = [...fieldRows.value]
    const [moved] = rows.splice(dragging.value, 1)
    rows.splice(targetIdx, 0, moved)
    rows.forEach((r, i) => (r.sortOrder = i))
    fieldRows.value = rows
    dragging.value = null
}

// ── Save ──────────────────────────────────────────────────────────────────────

function buildFieldConfigs(): IntakeFormFieldConfig[] {
    return fieldRows.value.map((r) => ({
        templateFieldId: r.templateFieldId,
        label: r.label,
        helpText: r.helpText || undefined,
        isRequired: r.isRequired,
        isConditional: r.isConditional,
        conditionalFieldId: r.isConditional ? r.conditionalFieldId : undefined,
        conditionalValue: r.isConditional ? r.conditionalValue : undefined,
        sortOrder: r.sortOrder
    }))
}

async function handleSave(): Promise<void> {
    saveError.value = ''
    if (!title.value.trim()) {
        saveError.value = 'Title is required.'
        return
    }
    isSaving.value = true
    try {
        if (isEditMode.value) {
            const req: UpdateIntakeFormRequest = {
                title: title.value,
                description: description.value || undefined,
                welcomeMessage: welcomeMessage.value || undefined,
                submitButtonText: submitButtonText.value,
                brandingColor: brandingColor.value || undefined,
                logoUrl: logoUrl.value || undefined,
                allowSaveResume: allowSaveResume.value,
                fields: buildFieldConfigs()
            }
            await store.updateForm(formId.value, req)
        } else {
            if (!selectedTemplateId.value) {
                saveError.value = 'Please select a template.'
                return
            }
            const workspaceId = authStore.user?.workspaceId
            if (!workspaceId) {
                saveError.value = 'No workspace found.'
                return
            }
            const req: CreateIntakeFormRequest = {
                templateId: selectedTemplateId.value,
                workspaceId: Number(workspaceId),
                title: title.value,
                description: description.value || undefined,
                welcomeMessage: welcomeMessage.value || undefined,
                brandingColor: brandingColor.value || undefined,
                allowSaveResume: allowSaveResume.value,
                fields: buildFieldConfigs()
            }
            const created = await store.createForm(req)
            router.replace(`/intake-forms/${created.id}/edit`)
            return
        }
        router.push('/intake-forms')
    } catch {
        saveError.value = 'Failed to save. Please try again.'
    } finally {
        isSaving.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex flex-col">
        <!-- Header -->
        <header
            class="bg-white border-b border-gray-200 shrink-0"
        >
            <div
                class="max-w-6xl mx-auto px-6 h-14
                    flex items-center gap-3"
            >
                <router-link
                    to="/intake-forms"
                    class="text-sm text-gray-400 hover:text-gray-900
                        transition-colors flex items-center gap-1"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Intake Forms
                </router-link>
                <span class="text-gray-300">/</span>
                <span class="text-sm font-semibold text-gray-900">
                    {{
                        isEditMode
                            ? 'Edit Form'
                            : 'New Intake Form'
                    }}
                </span>
            </div>
        </header>

        <!-- Two-panel layout -->
        <div
            class="flex-1 max-w-6xl mx-auto w-full px-6
                py-6 flex gap-6"
        >
            <!-- Left panel — form settings -->
            <div class="w-80 shrink-0 space-y-4">
                <!-- Template selector (create only) -->
                <div
                    v-if="!isEditMode"
                    class="bg-white rounded-xl border
                        border-gray-100 shadow-sm p-4"
                >
                    <label
                        class="block text-xs font-medium
                            text-gray-600 mb-1.5"
                    >
                        Template
                        <span class="text-red-400 ml-0.5">*</span>
                    </label>
                    <select
                        v-model="selectedTemplateId"
                        class="w-full rounded-lg border border-gray-200
                            px-3 py-2 text-sm focus:outline-none
                            focus:ring-2 focus:ring-gray-900
                            focus:border-transparent"
                    >
                        <option :value="null" disabled>
                            Select a template…
                        </option>
                        <option
                            v-for="tpl in templates"
                            :key="tpl.id"
                            :value="Number(tpl.id)"
                        >
                            {{ tpl.name }}
                        </option>
                    </select>
                </div>

                <!-- Settings card -->
                <div
                    class="bg-white rounded-xl border
                        border-gray-100 shadow-sm p-4 space-y-4"
                >
                    <h2
                        class="text-xs font-semibold text-gray-500
                            uppercase tracking-wide"
                    >
                        Form Settings
                    </h2>

                    <div>
                        <label
                            class="block text-xs font-medium
                                text-gray-600 mb-1"
                        >
                            Title
                            <span class="text-red-400 ml-0.5">*</span>
                        </label>
                        <input
                            v-model="title"
                            type="text"
                            placeholder="Client Intake Form"
                            class="w-full rounded-lg border border-gray-200
                                px-3 py-2 text-sm focus:outline-none
                                focus:ring-2 focus:ring-gray-900
                                focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-medium
                                text-gray-600 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            v-model="description"
                            rows="2"
                            placeholder="Brief description shown to clients"
                            class="w-full rounded-lg border border-gray-200
                                px-3 py-2 text-sm focus:outline-none
                                focus:ring-2 focus:ring-gray-900
                                focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-medium
                                text-gray-600 mb-1"
                        >
                            Welcome Message
                        </label>
                        <textarea
                            v-model="welcomeMessage"
                            rows="2"
                            placeholder="Shown at the top of the public form"
                            class="w-full rounded-lg border border-gray-200
                                px-3 py-2 text-sm focus:outline-none
                                focus:ring-2 focus:ring-gray-900
                                focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-medium
                                text-gray-600 mb-1"
                        >
                            Submit Button Text
                        </label>
                        <input
                            v-model="submitButtonText"
                            type="text"
                            class="w-full rounded-lg border border-gray-200
                                px-3 py-2 text-sm focus:outline-none
                                focus:ring-2 focus:ring-gray-900
                                focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-xs font-medium
                                text-gray-600 mb-1"
                        >
                            Branding Color
                        </label>
                        <div class="flex items-center gap-2">
                            <input
                                v-model="brandingColor"
                                type="color"
                                class="w-8 h-8 rounded border
                                    border-gray-200 cursor-pointer
                                    p-0.5"
                            />
                            <input
                                v-model="brandingColor"
                                type="text"
                                maxlength="7"
                                placeholder="#4f46e5"
                                class="flex-1 rounded-lg border
                                    border-gray-200 px-3 py-2 text-sm
                                    font-mono focus:outline-none
                                    focus:ring-2 focus:ring-gray-900
                                    focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            class="block text-xs font-medium
                                text-gray-600 mb-1"
                        >
                            Logo URL
                        </label>
                        <input
                            v-model="logoUrl"
                            type="url"
                            placeholder="https://…"
                            class="w-full rounded-lg border border-gray-200
                                px-3 py-2 text-sm focus:outline-none
                                focus:ring-2 focus:ring-gray-900
                                focus:border-transparent"
                        />
                    </div>

                    <label
                        class="flex items-center gap-2.5 cursor-pointer"
                    >
                        <input
                            v-model="allowSaveResume"
                            type="checkbox"
                            class="w-4 h-4 rounded border-gray-300
                                text-gray-900 focus:ring-gray-900"
                        />
                        <span class="text-sm text-gray-700">
                            Allow save &amp; resume
                        </span>
                    </label>
                </div>
            </div>

            <!-- Right panel — field configurator -->
            <div class="flex-1 min-w-0">
                <div
                    class="bg-white rounded-xl border border-gray-100
                        shadow-sm p-4"
                >
                    <h2
                        class="text-xs font-semibold text-gray-500
                            uppercase tracking-wide mb-4"
                    >
                        Fields
                    </h2>

                    <div
                        v-if="fieldRows.length === 0"
                        class="flex flex-col items-center justify-center
                            py-16 text-center text-gray-400"
                    >
                        <p class="text-sm">
                            {{
                                isEditMode
                                    ? 'No fields on this form.'
                                    : 'Select a template to configure fields.'
                            }}
                        </p>
                    </div>

                    <div v-else class="space-y-3">
                        <div
                            v-for="(field, idx) in fieldRows"
                            :key="field._tempId"
                            class="border border-gray-100 rounded-lg p-3
                                bg-gray-50 cursor-grab active:cursor-grabbing"
                            draggable="true"
                            @dragstart="onDragStart(idx)"
                            @dragover.prevent
                            @drop.prevent="onDrop(idx)"
                        >
                            <!-- Field header -->
                            <div
                                class="flex items-center gap-2 mb-3"
                            >
                                <svg
                                    class="w-4 h-4 text-gray-300
                                        shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 8h16M4 16h16"
                                    />
                                </svg>
                                <span
                                    class="text-xs font-semibold
                                        text-gray-700 flex-1"
                                >
                                    {{ field.label }}
                                </span>
                                <span
                                    class="text-xs px-1.5 py-0.5 rounded
                                        bg-gray-200 text-gray-500 font-mono
                                        uppercase"
                                >
                                    {{ field.fieldType }}
                                </span>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <!-- Label override -->
                                <div class="col-span-2">
                                    <label
                                        class="block text-xs text-gray-500
                                            mb-0.5"
                                    >
                                        Label
                                    </label>
                                    <input
                                        v-model="field.label"
                                        type="text"
                                        class="w-full rounded-md border
                                            border-gray-200 px-2.5 py-1.5
                                            text-sm focus:outline-none
                                            focus:ring-1
                                            focus:ring-gray-900"
                                    />
                                </div>

                                <!-- Help text -->
                                <div class="col-span-2">
                                    <label
                                        class="block text-xs text-gray-500
                                            mb-0.5"
                                    >
                                        Help text
                                    </label>
                                    <input
                                        v-model="field.helpText"
                                        type="text"
                                        placeholder="Optional hint for clients"
                                        class="w-full rounded-md border
                                            border-gray-200 px-2.5 py-1.5
                                            text-sm focus:outline-none
                                            focus:ring-1
                                            focus:ring-gray-900"
                                    />
                                </div>

                                <!-- Required toggle -->
                                <label
                                    class="flex items-center gap-2
                                        cursor-pointer"
                                >
                                    <input
                                        v-model="field.isRequired"
                                        type="checkbox"
                                        class="w-4 h-4 rounded
                                            border-gray-300 text-gray-900
                                            focus:ring-gray-900"
                                    />
                                    <span
                                        class="text-xs text-gray-600"
                                    >
                                        Required
                                    </span>
                                </label>

                                <!-- Conditional toggle -->
                                <label
                                    class="flex items-center gap-2
                                        cursor-pointer"
                                >
                                    <input
                                        v-model="field.isConditional"
                                        type="checkbox"
                                        class="w-4 h-4 rounded
                                            border-gray-300 text-gray-900
                                            focus:ring-gray-900"
                                    />
                                    <span
                                        class="text-xs text-gray-600"
                                    >
                                        Conditional
                                    </span>
                                </label>

                                <!-- Conditional config -->
                                <template v-if="field.isConditional">
                                    <div>
                                        <label
                                            class="block text-xs
                                                text-gray-500 mb-0.5"
                                        >
                                            Show when field
                                        </label>
                                        <select
                                            v-model="
                                                field.conditionalFieldId
                                            "
                                            class="w-full rounded-md
                                                border border-gray-200
                                                px-2.5 py-1.5 text-sm
                                                focus:outline-none
                                                focus:ring-1
                                                focus:ring-gray-900"
                                        >
                                            <option :value="undefined">
                                                — pick field —
                                            </option>
                                            <option
                                                v-for="other in fieldRows.filter(
                                                    (r) =>
                                                        r._tempId !==
                                                        field._tempId
                                                )"
                                                :key="other._tempId"
                                                :value="
                                                    other.templateFieldId
                                                "
                                            >
                                                {{ other.label }}
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            class="block text-xs
                                                text-gray-500 mb-0.5"
                                        >
                                            equals value
                                        </label>
                                        <input
                                            v-model="
                                                field.conditionalValue
                                            "
                                            type="text"
                                            placeholder="e.g. Yes"
                                            class="w-full rounded-md
                                                border border-gray-200
                                                px-2.5 py-1.5 text-sm
                                                focus:outline-none
                                                focus:ring-1
                                                focus:ring-gray-900"
                                        />
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom action bar -->
        <footer
            class="bg-white border-t border-gray-200 shrink-0"
        >
            <div
                class="max-w-6xl mx-auto px-6 h-14
                    flex items-center justify-between"
            >
                <p
                    v-if="saveError"
                    class="text-sm text-red-500"
                >
                    {{ saveError }}
                </p>
                <div class="ml-auto flex items-center gap-3">
                    <router-link
                        to="/intake-forms"
                        class="px-4 py-1.5 rounded-lg border
                            border-gray-200 text-sm font-medium
                            text-gray-700 hover:border-gray-400
                            transition-colors"
                    >
                        Cancel
                    </router-link>
                    <button
                        :disabled="isSaving"
                        class="px-4 py-1.5 rounded-lg bg-gray-900
                            text-white text-sm font-medium
                            hover:bg-gray-700 transition-colors
                            disabled:opacity-50
                            disabled:cursor-not-allowed"
                        @click="handleSave"
                    >
                        {{
                            isSaving
                                ? 'Saving…'
                                : isEditMode
                                  ? 'Save Changes'
                                  : 'Create Form'
                        }}
                    </button>
                </div>
            </div>
        </footer>
    </div>
</template>
