<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import type { BillingCycle, SubscriptionPlan } from '@/types/subscription'
import UsageMeter from '@/components/UsageMeter.vue'

const store = useSubscriptionStore()

const showPlanModal = ref(false)
const billingCycle = ref<BillingCycle>('MONTHLY')
const checkoutLoading = ref(false)

onMounted(async () => {
    await Promise.all([
        store.fetchMySubscription(),
        store.fetchPlans(),
        store.fetchUsage()
    ])
})

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

async function handleSelectPlan(plan: SubscriptionPlan): Promise<void> {
    checkoutLoading.value = true
    try {
        await store.startCheckout(plan.id, billingCycle.value)
    } finally {
        checkoutLoading.value = false
    }
}

function planPrice(plan: SubscriptionPlan): number {
    return billingCycle.value === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly
}

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    TRIALING: 'bg-blue-100 text-blue-700',
    PAST_DUE: 'bg-orange-100 text-orange-700',
    CANCELED: 'bg-red-100 text-red-700',
    FREE: 'bg-gray-100 text-gray-600'
}
</script>

<template>
    <div class="max-w-xl space-y-6">
        <!-- Current plan card -->
        <section
            v-if="store.mySubscription"
            class="border border-gray-200 rounded-xl p-5 space-y-3"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500 mb-0.5">Current plan</p>
                    <p class="text-base font-semibold text-gray-900">
                        {{ store.mySubscription.plan.name }}
                    </p>
                </div>
                <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="
                        statusColors[store.mySubscription.status] ??
                        'bg-gray-100 text-gray-600'
                    "
                >
                    {{ store.mySubscription.status }}
                </span>
            </div>
            <p
                v-if="!store.mySubscription.cancelAtPeriodEnd"
                class="text-xs text-gray-500"
            >
                Renews {{ formatDate(store.mySubscription.currentPeriodEnd) }}
            </p>
            <p v-else class="text-xs text-orange-600 font-medium">
                Cancels {{ formatDate(store.mySubscription.currentPeriodEnd) }}
            </p>
            <div class="flex gap-2 pt-1">
                <button
                    class="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 transition-colors"
                    @click="showPlanModal = true"
                >
                    Upgrade plan
                </button>
                <button
                    class="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    @click="store.openPortal()"
                >
                    Manage billing
                </button>
            </div>
        </section>

        <section v-else-if="store.loading" class="text-sm text-gray-400">
            Loading...
        </section>

        <!-- Usage meters -->
        <section v-if="store.usage && store.mySubscription" class="space-y-3">
            <h2 class="text-sm font-semibold text-gray-900">Usage this period</h2>
            <UsageMeter
                label="Documents"
                :used="store.usage.documentsCreated"
                :limit="store.mySubscription.plan.maxDocuments"
            />
            <UsageMeter
                label="Templates"
                :used="store.usage.templatesCreated"
                :limit="store.mySubscription.plan.maxTemplates"
            />
            <UsageMeter
                label="PDFs generated"
                :used="store.usage.pdfGenerated"
                :limit="-1"
            />
        </section>

        <!-- Plan selection modal -->
        <div
            v-if="showPlanModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            @click.self="showPlanModal = false"
        >
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl">
                <div class="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-semibold text-gray-900">
                            Choose a plan
                        </h3>
                        <button
                            class="text-gray-400 hover:text-gray-600"
                            @click="showPlanModal = false"
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
                    <!-- Billing toggle -->
                    <div class="flex items-center gap-3 text-sm">
                        <button
                            class="px-3 py-1 rounded-md font-medium transition-colors"
                            :class="
                                billingCycle === 'MONTHLY'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            "
                            @click="billingCycle = 'MONTHLY'"
                        >
                            Monthly
                        </button>
                        <button
                            class="px-3 py-1 rounded-md font-medium transition-colors"
                            :class="
                                billingCycle === 'YEARLY'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            "
                            @click="billingCycle = 'YEARLY'"
                        >
                            Yearly
                            <span class="ml-1 text-xs text-green-600 font-medium"
                                >Save ~17%</span
                            >
                        </button>
                    </div>
                </div>
                <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                        v-for="plan in store.plans"
                        :key="plan.id"
                        class="border border-gray-200 rounded-xl p-4 space-y-3 flex flex-col"
                        :class="{ 'border-gray-900': plan.tier === 'PRO' }"
                    >
                        <div>
                            <p class="text-xs font-medium text-gray-500 mb-0.5">
                                {{ plan.tier }}
                            </p>
                            <p class="text-xl font-bold text-gray-900">
                                ${{ planPrice(plan)
                                }}<span class="text-sm font-normal text-gray-500"
                                    >/mo</span
                                >
                            </p>
                            <p class="font-semibold text-gray-800 mt-0.5">
                                {{ plan.name }}
                            </p>
                        </div>
                        <ul class="text-xs text-gray-500 space-y-1 flex-1">
                            <li>
                                {{
                                    plan.maxDocuments === -1
                                        ? 'Unlimited'
                                        : plan.maxDocuments
                                }}
                                documents
                            </li>
                            <li>
                                {{
                                    plan.maxTemplates === -1
                                        ? 'Unlimited'
                                        : plan.maxTemplates
                                }}
                                templates
                            </li>
                            <li>
                                {{
                                    plan.maxWorkspaceMembers === -1
                                        ? 'Unlimited'
                                        : plan.maxWorkspaceMembers
                                }}
                                members
                            </li>
                        </ul>
                        <button
                            class="w-full py-2 text-sm font-medium rounded-md transition-colors"
                            :class="
                                plan.tier === 'PRO'
                                    ? 'bg-gray-900 text-white hover:bg-gray-700'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            "
                            :disabled="checkoutLoading"
                            @click="handleSelectPlan(plan)"
                        >
                            Select
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
