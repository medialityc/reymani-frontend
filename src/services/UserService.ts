import api from './api'

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener datos del usuario')
  }
}

export const updateCurrentUser = async (data: FormData) => {
  try {
    const response = await api.put('/users/me', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al actualizar el usuario')
  }
}
