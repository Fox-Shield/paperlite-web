<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplatesStore } from '@/stores/templates'
import AppSidebar from '@/components/AppSidebar.vue'
import FieldTypeIcon from '@/components/FieldTypeIcon.vue'

const route = useRoute()
const router = useRouter()
const templateStore = useTemplatesStore()

const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const showFieldTypePicker = ref(false)
const selectedFieldIndex = ref(null)

const FIELD_TYPES = [
    { type: 'TEXT', label: 'Text', desc: 'Single line text input' },
    { type: 'TEXTAREA', label: 'Text Area', desc: 'Multi-line text input' },
    { type: 'NUMBER', label: 'Number', desc: 'Numeric value' },
    { type: 'DATE', label: 'Date', desc: 'Date picker' },
    { type: 'CHECKBOX', label: 'Checkbox', desc: 'True / False toggle' },
    { type: 'SELECT', label: 'Select', desc: 'Choose from options' },
    { type: 'SIGNATURE', label: 'Signature', desc: 'Digital signature box' }
]

const FONT_FAMILIES = ['Inter', 'Georgia', 'Courier New']
const FONT_SIZES = [10, 11, 12, 14]
const PAGE_LAYOUTS = ['A4', 'Letter', 'Legal']

const templateName = ref('Untitled Template')
const templateDescription = ref('')
const templateCategory = ref('Other')
const fields = ref([])

const settings = reactive({
    fontFamily: 'Inter',
    fontSize: 12,
    pageLayout: 'A4'
})

// Selected field editing
const selectedField = computed(() =>
    selectedFieldIndex.value !== null ? fields.value[selectedFieldIndex.value] : null
)

function addField(type) {
    const newField = {
        id: Date.now(),
        type,
        label: `${FIELD_TYPES.find((f) => f.type === type)?.label || type} Field`,
        placeholder: '',
        required: false,
        defaultValue: '',
        options: ''
    }
    fields.value.push(newField)
    selectedFieldIndex.value = fields.value.length - 1
    showFieldTypePicker.value = false
}

function removeField(index) {
    fields.value.splice(index, 1)
    if (selectedFieldIndex.value === index) {
        selectedFieldIndex.value = null
    } else if (selectedFieldIndex.value > index) {
        selectedFieldIndex.value--
    }
}

function moveFieldUp(index) {
    if (index === 0) return
    const arr = fields.value
    ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
    if (selectedFieldIndex.value === index) selectedFieldIndex.value = index - 1
    else if (selectedFieldIndex.value === index - 1) selectedFieldIndex.value = index
}

function moveFieldDown(index) {
    if (index === fields.value.length - 1) return
    const arr = fields.value
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    if (selectedFieldIndex.value === index) selectedFieldIndex.value = index + 1
    else if (selectedFieldIndex.value === index + 1) selectedFieldIndex.value = index
}

function selectField(index) {
    selectedFieldIndex.value = selectedFieldIndex.value === index ? null : index
    showFieldTypePicker.value = false
}

async function save() {
    saving.value = true
    try {
        const payload = {
            name: templateName.value,
            description: templateDescription.value,
            category: templateCategory.value,
            settings: { ...settings },
            fields: fields.value.map(({ id, ...f }) => ({
                ...f,
                options:
                    f.type === 'SELECT'
                        ? f.options
                              .split(',')
                              .map((o) => o.trim())
                              .filter(Boolean)
                        : []
            }))
        }
        if (isEditing.value) {
            await templateStore.updateTemplate(route.params.id, payload)
        } else {
            await templateStore.createTemplate(payload)
        }
        router.push('/templates/my')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    if (isEditing.value) {
        const tmpl = await templateStore.fetchTemplate(route.params.id)
        if (tmpl) {
            templateName.value = tmpl.name || ''
            templateDescription.value = tmpl.description || ''
            templateCategory.value = tmpl.category || 'Other'
            if (tmpl.settings) Object.assign(settings, tmpl.settings)
            fields.value = (tmpl.fields || []).map((f, i) => ({
                ...f,
                id: f.id || Date.now() + i,
                options: Array.isArray(f.options) ? f.options.join(', ') : f.options || ''
            }))
        }
    }
})
</script>

<template>
    <div class="builder-layout">
        <AppSidebar />

        <div class="builder-content">
            <!-- Top save bar -->
            <div class="save-bar">
                <div class="save-bar-left">
                    <h2 class="save-bar-title">
                        {{ isEditing ? 'Edit Template' : 'New Template' }}
                    </h2>
                </div>
                <div class="save-bar-right">
                    <router-link to="/templates/my" class="cancel-link"
                        >Cancel</router-link
                    >
                    <button class="btn-save" :disabled="saving" @click="save">
                        <svg
                            v-if="saving"
                            class="spin-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        {{ saving ? 'Saving…' : 'Save Template' }}
                    </button>
                </div>
            </div>

            <!-- Split panel -->
            <div class="split-panel">
                <!-- Left: Field list -->
                <div class="left-panel">
                    <div class="panel-header">
                        <h3 class="panel-title">Fields</h3>
                        <button
                            class="btn-add-field"
                            @click="showFieldTypePicker = !showFieldTypePicker"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Field
                        </button>
                    </div>

                    <!-- Field type picker -->
                    <div v-if="showFieldTypePicker" class="field-type-picker">
                        <p class="picker-label">Choose field type</p>
                        <div class="picker-grid">
                            <button
                                v-for="ft in FIELD_TYPES"
                                :key="ft.type"
                                class="picker-btn"
                                @click="addField(ft.type)"
                            >
                                <FieldTypeIcon :type="ft.type" />
                                <div>
                                    <p class="picker-btn-label">{{ ft.label }}</p>
                                    <p class="picker-btn-desc">{{ ft.desc }}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Field list -->
                    <div class="field-list">
                        <div v-if="fields.length === 0" class="fields-empty">
                            <p>No fields yet.</p>
                            <p>Click "Add Field" to begin.</p>
                        </div>

                        <div
                            v-for="(field, index) in fields"
                            :key="field.id"
                            class="field-row"
                            :class="{ selected: selectedFieldIndex === index }"
                            @click="selectField(index)"
                        >
                            <div class="field-row-left">
                                <FieldTypeIcon :type="field.type" />
                                <div class="field-row-info">
                                    <p class="field-row-label">{{ field.label }}</p>
                                    <p class="field-row-type">{{ field.type }}</p>
                                </div>
                            </div>
                            <div class="field-row-actions">
                                <button
                                    class="icon-btn"
                                    title="Move up"
                                    @click.stop="moveFieldUp(index)"
                                    :disabled="index === 0"
                                >
                                    ▲
                                </button>
                                <button
                                    class="icon-btn"
                                    title="Move down"
                                    @click.stop="moveFieldDown(index)"
                                    :disabled="index === fields.length - 1"
                                >
                                    ▼
                                </button>
                                <button
                                    class="icon-btn danger"
                                    title="Delete"
                                    @click.stop="removeField(index)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Selected field editor -->
                    <div v-if="selectedField" class="field-editor">
                        <h4 class="editor-title">Edit Field</h4>

                        <div class="form-group">
                            <label>Label</label>
                            <input
                                v-model="selectedField.label"
                                type="text"
                                placeholder="Field label"
                            />
                        </div>

                        <div class="form-group">
                            <label>Placeholder</label>
                            <input
                                v-model="selectedField.placeholder"
                                type="text"
                                placeholder="Placeholder text"
                            />
                        </div>

                        <div v-if="selectedField.type === 'SELECT'" class="form-group">
                            <label
                                >Options
                                <span class="hint">(comma-separated)</span></label
                            >
                            <input
                                v-model="selectedField.options"
                                type="text"
                                placeholder="Option A, Option B, Option C"
                            />
                        </div>

                        <div
                            v-if="
                                selectedField.type !== 'CHECKBOX' &&
                                selectedField.type !== 'SIGNATURE'
                            "
                            class="form-group"
                        >
                            <label>Default Value</label>
                            <input
                                v-model="selectedField.defaultValue"
                                type="text"
                                placeholder="Default value"
                            />
                        </div>

                        <div class="form-group form-group-inline">
                            <label>Required</label>
                            <input v-model="selectedField.required" type="checkbox" />
                        </div>
                    </div>
                </div>

                <!-- Right: Live preview -->
                <div class="right-panel">
                    <div class="preview-settings">
                        <select v-model="settings.fontFamily" class="settings-select">
                            <option
                                v-for="font in FONT_FAMILIES"
                                :key="font"
                                :value="font"
                            >
                                {{ font }}
                            </option>
                        </select>
                        <select v-model="settings.fontSize" class="settings-select">
                            <option v-for="size in FONT_SIZES" :key="size" :value="size">
                                {{ size }}pt
                            </option>
                        </select>
                        <select v-model="settings.pageLayout" class="settings-select">
                            <option
                                v-for="layout in PAGE_LAYOUTS"
                                :key="layout"
                                :value="layout"
                            >
                                {{ layout }}
                            </option>
                        </select>
                    </div>

                    <div class="preview-area">
                        <div
                            class="preview-page"
                            :style="{
                                fontFamily: settings.fontFamily,
                                fontSize: settings.fontSize + 'pt'
                            }"
                        >
                            <!-- Template name -->
                            <div class="preview-template-name">
                                <input
                                    v-model="templateName"
                                    class="template-name-input"
                                    placeholder="Template Name"
                                    :style="{ fontFamily: settings.fontFamily }"
                                />
                            </div>

                            <!-- Description -->
                            <div class="preview-desc-row">
                                <input
                                    v-model="templateDescription"
                                    class="template-desc-input"
                                    placeholder="Template description (optional)"
                                    :style="{ fontFamily: settings.fontFamily }"
                                />
                                <select
                                    v-model="templateCategory"
                                    class="template-category-select"
                                >
                                    <option value="Contracts">Contracts</option>
                                    <option value="Proposals">Proposals</option>
                                    <option value="Leases">Leases</option>
                                    <option value="Wills">Wills</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div class="preview-divider" />

                            <!-- Fields preview -->
                            <div v-if="fields.length === 0" class="preview-empty">
                                <p>
                                    Add fields from the left panel to see a live preview
                                </p>
                            </div>

                            <div v-else class="preview-fields">
                                <div
                                    v-for="field in fields"
                                    :key="field.id"
                                    class="preview-field"
                                >
                                    <label class="preview-field-label">
                                        {{ field.label }}
                                        <span v-if="field.required" class="required-mark"
                                            >*</span
                                        >
                                    </label>

                                    <textarea
                                        v-if="field.type === 'TEXTAREA'"
                                        class="preview-input preview-textarea"
                                        :placeholder="field.placeholder || field.label"
                                        readonly
                                    />
                                    <select
                                        v-else-if="field.type === 'SELECT'"
                                        class="preview-input preview-select"
                                    >
                                        <option value="">
                                            {{ field.placeholder || 'Select an option…' }}
                                        </option>
                                        <option
                                            v-for="opt in (field.options || '')
                                                .split(',')
                                                .map((o) => o.trim())
                                                .filter(Boolean)"
                                            :key="opt"
                                            :value="opt"
                                        >
                                            {{ opt }}
                                        </option>
                                    </select>
                                    <div
                                        v-else-if="field.type === 'CHECKBOX'"
                                        class="preview-checkbox-row"
                                    >
                                        <input type="checkbox" :disabled="true" />
                                        <span>{{
                                            field.placeholder || field.label
                                        }}</span>
                                    </div>
                                    <div
                                        v-else-if="field.type === 'SIGNATURE'"
                                        class="preview-signature-box"
                                    >
                                        <span>✍ Signature</span>
                                    </div>
                                    <input
                                        v-else
                                        :type="
                                            field.type === 'NUMBER'
                                                ? 'number'
                                                : field.type === 'DATE'
                                                  ? 'date'
                                                  : 'text'
                                        "
                                        class="preview-input"
                                        :placeholder="field.placeholder || field.label"
                                        readonly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.builder-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: #f3f4f6;
}

.builder-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .save-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background: white;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0;

        .save-bar-title {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
        }

        .save-bar-right {
            display: flex;
            align-items: center;
            gap: 12px;

            .cancel-link {
                font-size: 14px;
                color: #6b7280;
                text-decoration: none;

                &:hover {
                    color: #374151;
                }
            }

            .btn-save {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: #4f46e5;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;

                &:hover:not(:disabled) {
                    background: #4338ca;
                }

                &:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spin-icon {
                    width: 14px;
                    height: 14px;
                    animation: spin 1s linear infinite;
                }
            }
        }
    }

    .split-panel {
        display: flex;
        flex: 1;
        overflow: hidden;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Left panel */
.left-panel {
    width: 40%;
    min-width: 320px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #f3f4f6;
        flex-shrink: 0;

        .panel-title {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
        }

        .btn-add-field {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s;

            svg {
                width: 14px;
                height: 14px;
            }

            &:hover {
                background: #4338ca;
            }
        }
    }

    .field-type-picker {
        padding: 16px 20px;
        border-bottom: 1px solid #f3f4f6;
        background: #fafafa;

        .picker-label {
            font-size: 11px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 10px;
        }

        .picker-grid {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .picker-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 10px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                text-align: left;
                transition: all 0.15s;

                &:hover {
                    border-color: #4f46e5;
                    background: #eff6ff;
                }

                .picker-btn-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #111827;
                }

                .picker-btn-desc {
                    font-size: 11px;
                    color: #9ca3af;
                }
            }
        }
    }

    .field-list {
        flex: 1;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .fields-empty {
            text-align: center;
            padding: 40px 20px;
            color: #9ca3af;
            font-size: 13px;
            line-height: 1.6;
        }

        .field-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
            cursor: pointer;
            transition: all 0.15s;

            &:hover {
                border-color: #e5e7eb;
                background: #f9fafb;
            }

            &.selected {
                border-color: #4f46e5;
                background: #eff6ff;
            }

            .field-row-left {
                display: flex;
                align-items: center;
                gap: 10px;

                .field-row-info {
                    .field-row-label {
                        font-size: 13px;
                        font-weight: 500;
                        color: #111827;
                    }

                    .field-row-type {
                        font-size: 11px;
                        color: #9ca3af;
                    }
                }
            }

            .field-row-actions {
                display: flex;
                gap: 2px;
                opacity: 0;
                transition: opacity 0.15s;

                .icon-btn {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 10px;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.1s;

                    &:hover:not(:disabled) {
                        background: #e5e7eb;
                        color: #374151;
                    }

                    &:disabled {
                        opacity: 0.3;
                        cursor: not-allowed;
                    }

                    &.danger:hover {
                        background: #fee2e2;
                        color: #dc2626;
                    }
                }
            }

            &:hover .field-row-actions {
                opacity: 1;
            }
        }
    }

    .field-editor {
        border-top: 1px solid #e5e7eb;
        padding: 16px 20px;
        background: #fafafa;
        flex-shrink: 0;

        .editor-title {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }

        .form-group {
            margin-bottom: 12px;

            label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 4px;

                .hint {
                    font-weight: 400;
                    color: #9ca3af;
                }
            }

            input[type='text'],
            input[type='number'] {
                width: 100%;
                padding: 7px 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.15s;

                &:focus {
                    border-color: #4f46e5;
                }
            }

            &.form-group-inline {
                display: flex;
                align-items: center;
                gap: 8px;

                label {
                    margin-bottom: 0;
                }

                input[type='checkbox'] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
            }
        }
    }
}

/* Right panel */
.right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .preview-settings {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: white;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0;

        .settings-select {
            padding: 5px 8px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 13px;
            outline: none;
            cursor: pointer;
            background: white;

            &:focus {
                border-color: #4f46e5;
            }
        }
    }

    .preview-area {
        flex: 1;
        overflow-y: auto;
        padding: 32px;
        display: flex;
        justify-content: center;

        .preview-page {
            width: 100%;
            max-width: 680px;
            background: white;
            border-radius: 4px;
            box-shadow:
                0 1px 3px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(0, 0, 0, 0.05);
            padding: 48px 52px;
            min-height: 600px;

            .preview-template-name {
                margin-bottom: 8px;

                .template-name-input {
                    width: 100%;
                    border: none;
                    outline: none;
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    background: transparent;

                    &::placeholder {
                        color: #d1d5db;
                    }
                }
            }

            .preview-desc-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;

                .template-desc-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 13px;
                    color: #6b7280;
                    background: transparent;

                    &::placeholder {
                        color: #d1d5db;
                    }
                }

                .template-category-select {
                    font-size: 12px;
                    padding: 3px 8px;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    outline: none;
                    cursor: pointer;
                    color: #374151;
                }
            }

            .preview-divider {
                border: none;
                border-top: 1px solid #e5e7eb;
                margin-bottom: 28px;
            }

            .preview-empty {
                text-align: center;
                padding: 60px 20px;
                color: #9ca3af;
                font-size: 14px;
            }

            .preview-fields {
                display: flex;
                flex-direction: column;
                gap: 20px;

                .preview-field {
                    .preview-field-label {
                        display: block;
                        font-size: 13px;
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 6px;

                        .required-mark {
                            color: #ef4444;
                            margin-left: 2px;
                        }
                    }

                    .preview-input {
                        width: 100%;
                        padding: 8px 10px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 13px;
                        color: #374151;
                        background: #f9fafb;
                        outline: none;

                        &::placeholder {
                            color: #9ca3af;
                        }
                    }

                    .preview-textarea {
                        min-height: 80px;
                        resize: vertical;
                    }

                    .preview-select {
                        cursor: pointer;
                    }

                    .preview-checkbox-row {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 13px;
                        color: #374151;

                        input[type='checkbox'] {
                            width: 16px;
                            height: 16px;
                        }
                    }

                    .preview-signature-box {
                        height: 80px;
                        border: 1px dashed #d1d5db;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #9ca3af;
                        font-size: 14px;
                        background: #f9fafb;
                    }
                }
            }
        }
    }
}
</style>
