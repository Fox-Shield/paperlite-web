import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const accessToken = ref(localStorage.getItem('access_token') || null)

    const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

    async function login(email, password) {
        const { data } = await api.post('/auth/login', { email, password })
        setAuth(data)
        return data
    }

    async function register(firstName, lastName, email, password) {
        const { data } = await api.post('/auth/register', { firstName, lastName, email, password })
        setAuth(data)
        return data
    }

    async function fetchMe() {
        const { data } = await api.get('/auth/me')
        user.value = data
        localStorage.setItem('user', JSON.stringify(data))
        return data
    }

    function logout() {
        user.value = null
        accessToken.value = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
    }

    function setAuth(data) {
        accessToken.value = data.accessToken
        user.value = data.user
        localStorage.setItem('access_token', data.accessToken)
        localStorage.setItem('refresh_token', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
    }

    return { user, accessToken, isAuthenticated, login, register, fetchMe, logout }
})
