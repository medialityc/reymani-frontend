import type { LoginResponse } from '@/types/responses/LoginResponse'

import type { LoginRequest } from '@/types/requests/LoginRequest'

import api from './api'

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', data)

    return response.data
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Credenciales Inválidas')
    }

    throw new Error('Error al iniciar sesión')
  }
}
