'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import { getCurrentUser } from '@/services/UserService'
import { saveToken, removeToken, getToken } from '@/utils/tokenStorage'

const AuthContext = createContext<{
  isAuthenticated: boolean
  user: any
  login: (response: { token: string; [key: string]: any }) => Promise<void>
  logout: () => void
  updateUser: (user: any) => void
}>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  updateUser: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getToken()

      setIsAuthenticated(!!token)

      if (token) {
        getCurrentUser()
          .then(data => setCurrentUser(data))
          .catch(err => console.error(err))
      }
    }
  }, [])

  const login = async (response: { token: string; [key: string]: any }) => {
    saveToken(response.token)
    setIsAuthenticated(true)

    try {
      // Esperar a que se carguen los datos del usuario
      const userData = await getCurrentUser()

      setCurrentUser(userData)
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => {
    removeToken()
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const updateUser = (user: any) => {
    setCurrentUser(user)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
