import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        async login(username, password) {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'password',
                        username: username,
                        password: password,
                        scope: '',
                        client_id: 'string',
                        client_secret: 'string',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Login failed')
                }

                const data = await response.json()

                this.token = data.access_token
                this.user = data.user
                localStorage.setItem('token', this.token)
            } catch (error) {
                console.error(error)
                throw error
            }
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
        },

        restoreToken() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
                // Du kan vælge at hente brugerdata igen her
            }
        }
    }
})
