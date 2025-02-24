import api from './api'

export const login = async (data: any): Promise<any> => {
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

export const forgotPassword = async (data: { email: string }): Promise<{ message: string }> => {
  try {
    const response = await api.post('/auth/forgot-password', data)

    if (response.status === 200) {
      return response.data
    }

    throw new Error('Error al enviar el código de restablecimiento')
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al enviar el código de restablecimiento')
  }
}

export const resetPassword = async (data: {
  confirmationCode: string
  password: string
  email: string
}): Promise<{ message: string } | null> => {
  const response = await api.post('/auth/reset-password', data)

  // Si el interceptor devuelve { data: null } en un 404, retornamos null
  return response.data
}

// Agregar función changePassword
export const changePassword = async (data: {
  currentPassword: string
  newPassword: string
}): Promise<{ message: string }> => {
  try {
    const response = await api.post('/auth/change-password', data)

    return response.data
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw { status: 400, message: 'La contraseña actual no es correcta' }
    }

    throw { status: error.response?.status || 500, message: 'Error al cambiar la contraseña' }
  }
}
