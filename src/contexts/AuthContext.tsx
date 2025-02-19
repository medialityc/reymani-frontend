'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import type { LoginResponse } from '@/types/responses/LoginResponse'

import { saveToken, removeToken, getToken } from '@/utils/tokenStorage'

const AuthContext = createContext<{
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
}>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getToken()

      setIsAuthenticated(!!token)
    }
  }, [])

  const login = (response: LoginResponse) => {
    saveToken(response.token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    removeToken()
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
