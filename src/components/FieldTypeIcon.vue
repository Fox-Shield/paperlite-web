<script setup>
defineProps({
    type: {
        type: String,
        required: true
    }
})

const fieldTypes = {
    TEXT: { label: 'Text', icon: 'T' },
    NUMBER: { label: 'Number', icon: '#' },
    DATE: { label: 'Date', icon: '📅' },
    CHECKBOX: { label: 'Checkbox', icon: '☑' },
    SIGNATURE: { label: 'Signature', icon: '✍' },
    SELECT: { label: 'Select', icon: '≡' },
    TEXTAREA: { label: 'Text Area', icon: '¶' }
}
</script>

<template>
    <span class="field-type-icon" :title="fieldTypes[type]?.label || type">
        {{ fieldTypes[type]?.icon || '?' }}
    </span>
</template>

<style scoped>
.field-type-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    font-family: monospace;
    flex-shrink: 0;
    cursor: default;
}
</style>
