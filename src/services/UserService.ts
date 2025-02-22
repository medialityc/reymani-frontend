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
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar el usuario' }
    }

    throw { status: 500, message: 'Error al actualizar el usuario' }
  }
}

export const getUsersSearch = async (filters: any) => {
  try {
    const response = await api.get('/users/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios')
  }
}
