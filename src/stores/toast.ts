import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: number
    type: ToastType
    message: string
    action?: { label: string; href: string }
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])

    function add(type: ToastType, message: string, action?: Toast['action']): void {
        const id = nextId++
        toasts.value.push({ id, type, message, action })
        setTimeout(() => remove(id), 5000)
    }

    function remove(id: number): void {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    const success = (msg: string) => add('success', msg)
    const error = (msg: string, action?: Toast['action']) => add('error', msg, action)
    const warning = (msg: string, action?: Toast['action']) => add('warning', msg, action)
    const info = (msg: string) => add('info', msg)

    return { toasts, add, remove, success, error, warning, info }
})
