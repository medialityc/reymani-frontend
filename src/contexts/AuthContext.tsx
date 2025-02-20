'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import { getCurrentUser } from '@/services/UserService'
import type { LoginResponse } from '@/types/responses/LoginResponse'
import { saveToken, removeToken, getToken } from '@/utils/tokenStorage'

const AuthContext = createContext<{
  isAuthenticated: boolean
  user: any
  login: (response: LoginResponse) => void
  logout: () => void
  updateUser: (user: any) => void
}>({
  isAuthenticated: false,
  user: null,
  login: () => {},
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

  const login = (response: LoginResponse) => {
    saveToken(response.token)
    setIsAuthenticated(true)

    // Opcional: cargar el usuario tras el login
    getCurrentUser()
      .then(data => setCurrentUser(data))
      .catch(err => console.error(err))
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
