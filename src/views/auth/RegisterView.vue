<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
    error.value = ''
    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.'
        return
    }
    loading.value = true
    try {
        await authStore.register(
            firstName.value,
            lastName.value,
            email.value,
            password.value
        )
        router.push('/dashboard')
    } catch (e) {
        error.value =
            e.response?.data?.message || 'Registration failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div
            class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
            <div class="mb-8 text-center">
                <h1 class="text-2xl font-semibold text-gray-900">PaperLite</h1>
                <p class="mt-1 text-sm text-gray-500">Create your account</p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            for="firstName"
                            class="block text-sm font-medium text-gray-700 mb-1"
                            >First name</label
                        >
                        <input
                            id="firstName"
                            v-model="firstName"
                            type="text"
                            required
                            autocomplete="given-name"
                            placeholder="Jane"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label
                            for="lastName"
                            class="block text-sm font-medium text-gray-700 mb-1"
                            >Last name</label
                        >
                        <input
                            id="lastName"
                            v-model="lastName"
                            type="text"
                            required
                            autocomplete="family-name"
                            placeholder="Doe"
                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Email</label
                    >
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        autocomplete="email"
                        placeholder="you@example.com"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Password</label
                    >
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        autocomplete="new-password"
                        placeholder="••••••••"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label
                        for="confirmPassword"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Confirm password</label
                    >
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        required
                        autocomplete="new-password"
                        placeholder="••••••••"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {{ loading ? 'Creating account…' : 'Create account' }}
                </button>
            </form>

            <p class="mt-6 text-center text-sm text-gray-500">
                Already have an account?
                <RouterLink
                    to="/login"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                    >Sign in</RouterLink
                >
            </p>
        </div>
    </div>
</template>
