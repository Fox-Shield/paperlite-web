import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscriptionApi, usageApi } from '@/services/api'
import type { SubscriptionPlan, UserSubscription, UsageRecord, BillingCycle } from '@/types/subscription'

export const useSubscriptionStore = defineStore('subscription', () => {
    const plans = ref<SubscriptionPlan[]>([])
    const mySubscription = ref<UserSubscription | null>(null)
    const usage = ref<UsageRecord | null>(null)
    const loading = ref(false)

    async function fetchPlans(): Promise<void> {
        loading.value = true
        try {
            const { data } = await subscriptionApi.getPlans()
            plans.value = data
        } finally {
            loading.value = false
        }
    }

    async function fetchMySubscription(): Promise<void> {
        loading.value = true
        try {
            const { data } = await subscriptionApi.getMy()
            mySubscription.value = data
        } finally {
            loading.value = false
        }
    }

    async function fetchUsage(): Promise<void> {
        loading.value = true
        try {
            const { data } = await usageApi.getUsage()
            usage.value = data
        } finally {
            loading.value = false
        }
    }

    async function startCheckout(planId: number, billingCycle: BillingCycle): Promise<void> {
        const { data } = await subscriptionApi.createCheckout(planId, billingCycle)
        window.location.href = data.checkoutUrl
    }

    async function openPortal(): Promise<void> {
        const { data } = await subscriptionApi.createPortal()
        window.location.href = data.portalUrl
    }

    return {
        plans,
        mySubscription,
        usage,
        loading,
        fetchPlans,
        fetchMySubscription,
        fetchUsage,
        startCheckout,
        openPortal
    }
})
