import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
    const accessToken = ref<string | null>(localStorage.getItem('access_token'))

    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

    async function login(email: string, password: string): Promise<AuthResponse> {
        const payload: LoginRequest = { email, password }
        const { data } = await api.post<AuthResponse>('/auth/login', payload)
        setAuth(data)
        return data
    }

    async function register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<AuthResponse> {
        const payload: RegisterRequest = { firstName, lastName, email, password }
        const { data } = await api.post<AuthResponse>('/auth/register', payload)
        setAuth(data)
        return data
    }

    async function fetchMe(): Promise<User> {
        const { data } = await api.get<User>('/auth/me')
        user.value = data
        localStorage.setItem('user', JSON.stringify(data))
        return data
    }

    function logout(): void {
        user.value = null
        accessToken.value = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
    }

    function setAuth(data: AuthResponse): void {
        accessToken.value = data.accessToken
        user.value = data.user
        localStorage.setItem('access_token', data.accessToken)
        localStorage.setItem('refresh_token', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
    }

    return { user, accessToken, isAuthenticated, login, register, fetchMe, logout }
})
