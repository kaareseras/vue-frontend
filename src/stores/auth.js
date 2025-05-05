import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user && state.user.is_admin === true,
  },
  actions: {
    async login(username, password) {
      try {
        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
            accept: 'application/json',
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
        })

        if (!response.ok) {
          throw new Error('Login failed')
        }

        const data = await response.json()
        this.token = data.access_token
        localStorage.setItem('token', this.token)

        // Hent brugerdata fra /users/me
        await this.fetchUser()
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const response = await fetch('http://localhost:8000/users/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
            accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        this.user = userData
      } catch (error) {
        console.error('Error fetching user:', error)
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    async restoreToken() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        await this.fetchUser() // ← henter brugerdata igen
      }
    },
  },
})
