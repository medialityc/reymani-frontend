'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import type { LoginResponse } from '@/types/responses/LoginResponse'

import { saveToken, removeToken } from '@/utils/tokenStorage'
import usePermissions from '@/hooks/usePermissions'

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
  const { savePermissions, removePermissions } = usePermissions()

  useEffect(() => {
    const token = localStorage.getItem('authToken')

    setIsAuthenticated(!!token)
  }, [])

  const login = (response: LoginResponse) => {
    saveToken(response.token)
    savePermissions(response.permissions)
    setIsAuthenticated(true)
  }

  const logout = () => {
    removeToken()
    removePermissions()
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
